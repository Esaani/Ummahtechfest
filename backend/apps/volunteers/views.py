import logging

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.volunteers.models import VolunteerApplication, VolunteerApplicationStatus
from apps.volunteers.serializers import (
    VolunteerApplicationSerializer,
    VolunteerApplicationWithdrawSerializer,
)
from apps.volunteers.services import VolunteerRoleCacheService
from common.tasks import send_email_task
from common.telegram_monitor import monitor_event
from common.throttling import ScopedUserRateThrottle

logger = logging.getLogger('ummah_tech_fest')


class VolunteerRoleListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        roles = VolunteerRoleCacheService.get_active_roles()
        return Response({'data': roles})


class VolunteerApplicationEligibilityView(APIView):
    """Whether the authenticated user may start a new application."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        has_application = VolunteerApplication.objects.filter(user=request.user).exists()
        return Response({
            'data': {
                'can_apply': not has_application,
                'has_application': has_application,
            },
        })


class VolunteerApplicationCreateView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedUserRateThrottle]
    throttle_scope = 'authenticated_form'

    def post(self, request):
        if VolunteerApplication.objects.filter(user=request.user).exists():
            return Response(
                {
                    'error': {
                        'code': 'APPLICATION_EXISTS',
                        'message': 'You have already submitted a volunteer application. Each person may apply only once.',
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = VolunteerApplicationSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        application = serializer.save()
        logger.info('volunteer_application_submitted user_id=%s application_id=%s', request.user.id, application.id)
        pathway = application.preferred_roles.first()
        monitor_event(
            'volunteer_application_submitted',
            email=request.user.email,
            user_id=str(request.user.id),
            pathway=pathway.name if pathway else '',
        )
        send_email_task.delay(
            'volunteer_application_received',
            request.user.email,
            {
                'first_name': request.user.first_name or request.user.email.split('@')[0],
                'pathway_name': pathway.name if pathway else '',
            },
        )
        return Response({'data': VolunteerApplicationSerializer(application).data}, status=status.HTTP_201_CREATED)


class VolunteerApplicationMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        application = (
            VolunteerApplication.objects.filter(user=request.user)
            .select_related('assigned_role')
            .prefetch_related('preferred_roles')
            .first()
        )
        has_application = application is not None
        return Response({
            'data': VolunteerApplicationSerializer(application).data if application else None,
            'meta': {
                'can_apply': not has_application,
                'has_application': has_application,
                'can_withdraw': application.can_withdraw if application else False,
            },
        })

    def patch(self, request):
        application = get_object_or_404(VolunteerApplication, user=request.user)
        withdraw_serializer = VolunteerApplicationWithdrawSerializer(
            data=request.data,
            context={'application': application},
        )
        withdraw_serializer.is_valid(raise_exception=True)
        old_status = application.status
        application.status = VolunteerApplicationStatus.WITHDRAWN
        application.save(update_fields=['status', 'updated_at'])
        from apps.volunteers.models import VolunteerApplicationStatusHistory
        VolunteerApplicationStatusHistory.objects.create(
            application=application,
            from_status=old_status,
            to_status=application.status,
            changed_by=request.user,
            note='Withdrawn by applicant before review',
        )
        logger.info('volunteer_application_withdrawn user_id=%s application_id=%s', request.user.id, application.id)
        monitor_event(
            'volunteer_application_withdrawn',
            email=request.user.email,
            user_id=str(request.user.id),
        )
        return Response({
            'data': VolunteerApplicationSerializer(application).data,
            'meta': {
                'can_apply': False,
                'has_application': True,
                'can_withdraw': False,
            },
        })
