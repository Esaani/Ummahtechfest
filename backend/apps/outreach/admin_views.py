from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.outreach.models import (
    SpeakerApplication,
    SpeakerApplicationStatus,
    SponsorInquiry,
    SponsorInquiryStatus,
    TicketWaitlist,
    TicketWaitlistStatus,
)
from apps.outreach.serializers import (
    SpeakerApplicationAdminSerializer,
    SponsorInquiryAdminSerializer,
    TicketWaitlistAdminSerializer,
)
from apps.outreach.services.speaker_sync import sync_featured_speaker_from_application
from common.admin_roles import PERM_SUBMISSIONS_MANAGE
from common.email_service import send_templated_email
from common.permissions import HasAdminPermission


class AdminSponsorInquiryListView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def get(self, request):
        qs = SponsorInquiry.objects.all().order_by('-created_at')
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return Response({
            'data': SponsorInquiryAdminSerializer(qs, many=True).data,
        })


class AdminSponsorInquiryDetailView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def patch(self, request, inquiry_id):
        inquiry = get_object_or_404(SponsorInquiry, id=inquiry_id)
        old_status = inquiry.status
        serializer = SponsorInquiryAdminSerializer(inquiry, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        inquiry = serializer.save()

        if inquiry.status != old_status:
            send_templated_email(
                'submission_status_updated',
                inquiry.email,
                {
                    'name': inquiry.full_name,
                    'submission_type': 'Sponsorship Inquiry',
                    'status_label': inquiry.get_status_display(),
                    'message': request.data.get('status_note'),
                },
            )
        return Response({'data': SponsorInquiryAdminSerializer(inquiry).data})


class AdminSpeakerApplicationListView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def get(self, request):
        qs = SpeakerApplication.objects.select_related('profile_image_asset').order_by('-created_at')
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return Response({
            'data': SpeakerApplicationAdminSerializer(
                qs, many=True, context={'request': request},
            ).data,
        })


class AdminSpeakerApplicationDetailView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def get(self, request, application_id):
        application = get_object_or_404(
            SpeakerApplication.objects.select_related('profile_image_asset'),
            id=application_id,
        )
        return Response({
            'data': SpeakerApplicationAdminSerializer(application, context={'request': request}).data,
        })

    def patch(self, request, application_id):
        application = get_object_or_404(
            SpeakerApplication.objects.select_related('profile_image_asset'),
            id=application_id,
        )
        old_status = application.status
        serializer = SpeakerApplicationAdminSerializer(
            application, data=request.data, partial=True, context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        application = serializer.save()
        sync_featured_speaker_from_application(application)

        if application.status != old_status:
            send_templated_email(
                'submission_status_updated',
                application.email,
                {
                    'name': application.full_name,
                    'submission_type': 'Speaker Application',
                    'status_label': application.get_status_display(),
                    'message': request.data.get('status_note'),
                },
            )
        return Response({
            'data': SpeakerApplicationAdminSerializer(application, context={'request': request}).data,
        })


class AdminTicketWaitlistListView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def get(self, request):
        qs = TicketWaitlist.objects.all().order_by('-created_at')
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return Response({
            'data': TicketWaitlistAdminSerializer(qs, many=True).data,
        })


class AdminTicketWaitlistDetailView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def patch(self, request, entry_id):
        entry = get_object_or_404(TicketWaitlist, id=entry_id)
        old_status = entry.status
        serializer = TicketWaitlistAdminSerializer(entry, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        entry = serializer.save()

        if entry.status != old_status:
            send_templated_email(
                'submission_status_updated',
                entry.email,
                {
                    'name': entry.full_name,
                    'submission_type': 'Ticket Waitlist Request',
                    'status_label': entry.get_status_display(),
                    'message': request.data.get('status_note'),
                },
            )
        return Response({'data': TicketWaitlistAdminSerializer(entry).data})
