import logging
from datetime import timedelta

from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncDate
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.registrations.models import PassRegistration, PassRegistrationStatus, PassType
from common.tasks import send_email_task
from apps.registrations.serializers import (
    OpenPassRegistrationSerializer,
    PassRegistrationSerializer,
    PassTypeAdminSerializer,
    PassTypeSerializer,
    SpecialAccessRegistrationSerializer,
)
from common.admin_roles import PERM_CMS_MANAGE, PERM_SUBMISSIONS_MANAGE
from common.permissions import HasAnyAdminPermission
from common.permissions import HasAdminPermission
from common.telegram_monitor import monitor_event
from common.throttling import ScopedUserRateThrottle

logger = logging.getLogger('ummah_tech_fest')


class PassTypeListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        types = PassType.objects.filter(is_active=True, show_on_signup=True).order_by('sort_order', 'name')
        return Response({'data': PassTypeSerializer(types, many=True).data})


class AdminPassTypeListCreateView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_CMS_MANAGE

    def get(self, request):
        types = PassType.objects.order_by('sort_order', 'name')
        return Response({'data': PassTypeAdminSerializer(types, many=True).data})

    def post(self, request):
        serializer = PassTypeAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pt = serializer.save()
        logger.info('pass_type_created slug=%s user_id=%s', pt.slug, request.user.id)
        return Response({'data': PassTypeAdminSerializer(pt).data}, status=status.HTTP_201_CREATED)


class AdminPassTypeDetailView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_CMS_MANAGE

    def patch(self, request, pass_type_id):
        pt = get_object_or_404(PassType, id=pass_type_id)
        serializer = PassTypeAdminSerializer(pt, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        pt = serializer.save()
        return Response({'data': PassTypeAdminSerializer(pt).data})

    def delete(self, request, pass_type_id):
        pt = get_object_or_404(PassType, id=pass_type_id)
        pt.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PassRegistrationMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reg = PassRegistration.objects.filter(user=request.user).select_related('pass_type').first()
        has_registration = reg is not None
        return Response({
            'data': PassRegistrationSerializer(reg).data if reg else None,
            'meta': {'has_registration': has_registration, 'can_register': not has_registration},
        })


class OpenPassRegistrationCreateView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedUserRateThrottle]
    throttle_scope = 'authenticated_form'

    def post(self, request):
        if PassRegistration.objects.filter(user=request.user).exists():
            return Response({
                'error': {
                    'code': 'REGISTRATION_EXISTS',
                    'message': 'You already have an event pass registration.',
                },
            }, status=status.HTTP_400_BAD_REQUEST)
        serializer = OpenPassRegistrationSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        reg = serializer.save()
        logger.info('open_pass_registered user_id=%s pass=%s', request.user.id, reg.pass_type.slug)
        monitor_event(
            'open_pass_registered',
            email=request.user.email,
            user_id=str(request.user.id),
            pass_slug=reg.pass_type.slug,
        )
        return Response({'data': PassRegistrationSerializer(reg).data}, status=status.HTTP_201_CREATED)


class SpecialAccessRegistrationCreateView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedUserRateThrottle]
    throttle_scope = 'authenticated_form'

    def post(self, request):
        if PassRegistration.objects.filter(user=request.user).exists():
            return Response({
                'error': {
                    'code': 'REGISTRATION_EXISTS',
                    'message': 'You already have an event pass registration.',
                },
            }, status=status.HTTP_400_BAD_REQUEST)
        serializer = SpecialAccessRegistrationSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        reg = serializer.save()
        logger.info('special_access_registered user_id=%s pass=%s', request.user.id, reg.pass_type.slug)
        monitor_event(
            'special_access_registered',
            email=request.user.email,
            user_id=str(request.user.id),
            pass_slug=reg.pass_type.slug,
        )
        send_email_task.delay(
            'pass_registration_received',
            request.user.email,
            {
                'first_name': request.user.first_name or request.user.email.split('@')[0],
                'pass_title': reg.pass_type.name,
            },
        )
        return Response({'data': PassRegistrationSerializer(reg).data}, status=status.HTTP_201_CREATED)


class AdminDashboardStatsView(APIView):
    """Aggregate stats for the admin dashboard — one request, all panels."""

    permission_classes = [HasAnyAdminPermission]

    def get(self, request):
        from apps.outreach.models import SpeakerApplication, SpeakerApplicationStatus, SponsorInquiry
        from apps.volunteers.models import VolunteerApplication, VolunteerApplicationStatus
        from apps.payments.models import Donation, Payment, PaymentStatus, PaymentPurpose

        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        # ── Registrations ──────────────────────────────────────────────
        reg_qs = PassRegistration.objects.filter(deleted_at__isnull=True)
        reg_total = reg_qs.count()
        reg_approved = reg_qs.filter(status=PassRegistrationStatus.APPROVED).count()
        reg_paid = reg_qs.filter(status=PassRegistrationStatus.PAID).count()
        reg_pending = reg_qs.filter(
            status__in=[PassRegistrationStatus.SUBMITTED, PassRegistrationStatus.UNDER_REVIEW]
        ).count()

        # 30-day trend: count registrations grouped by date
        trend_qs = (
            reg_qs.filter(created_at__gte=thirty_days_ago)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )
        registration_trend = [
            {'date': str(row['date']), 'count': row['count']}
            for row in trend_qs
        ]

        # ── Speakers ───────────────────────────────────────────────────
        speaker_qs = SpeakerApplication.objects.filter(deleted_at__isnull=True)
        speaker_total = speaker_qs.count()
        speaker_pending = speaker_qs.filter(status=SpeakerApplicationStatus.SUBMITTED).count()
        speaker_approved = speaker_qs.filter(status=SpeakerApplicationStatus.ACCEPTED).count()
        speaker_rejected = speaker_qs.filter(status=SpeakerApplicationStatus.REJECTED).count()

        # ── Volunteers ─────────────────────────────────────────────────
        vol_qs = VolunteerApplication.objects.filter(deleted_at__isnull=True)
        vol_total = vol_qs.count()
        vol_pending = vol_qs.filter(status=VolunteerApplicationStatus.SUBMITTED).count()
        vol_approved = vol_qs.filter(status=VolunteerApplicationStatus.ACCEPTED).count()
        vol_rejected = vol_qs.filter(status=VolunteerApplicationStatus.REJECTED).count()

        # ── Donations ──────────────────────────────────────────────────
        donation_payments = Payment.objects.filter(
            purpose=PaymentPurpose.DONATION,
            status=PaymentStatus.SUCCESS,
            deleted_at__isnull=True,
        )
        donation_total_amount = donation_payments.aggregate(total=Sum('amount'))['total'] or 0
        donation_count = donation_payments.count()

        # ── Sponsors ───────────────────────────────────────────────────
        sponsor_qs = SponsorInquiry.objects.filter(deleted_at__isnull=True)
        sponsor_total = sponsor_qs.count()

        # ── CMS schedule quick count ───────────────────────────────────
        from apps.cms.models import ScheduleSession
        schedule_count = ScheduleSession.objects.filter(deleted_at__isnull=True).count()

        data = {
            'registrations': {
                'total': reg_total,
                'approved': reg_approved,
                'paid': reg_paid,
                'pending': reg_pending,
                'trend': registration_trend,
            },
            'speakers': {
                'total': speaker_total,
                'pending': speaker_pending,
                'approved': speaker_approved,
                'rejected': speaker_rejected,
            },
            'volunteers': {
                'total': vol_total,
                'pending': vol_pending,
                'approved': vol_approved,
                'rejected': vol_rejected,
            },
            'donations': {
                'total_amount': float(donation_total_amount),
                'count': donation_count,
            },
            'sponsors': {
                'total': sponsor_total,
            },
            'schedule': {
                'session_count': schedule_count,
            },
        }
        return Response({'data': data})
