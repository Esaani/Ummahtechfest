import logging

from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.volunteers.models import (
    VolunteerAnnouncement,
    VolunteerApplication,
    VolunteerApplicationStatus,
    VolunteerTask,
)
from apps.volunteers.serializers import (
    VolunteerAnnouncementSerializer,
    VolunteerApplicationSerializer,
    VolunteerApplicationWithdrawSerializer,
    VolunteerTaskSerializer,
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


# ── Volunteer Portal ──────────────────────────────────────────────────────────

def _get_accepted_application(user):
    """Return the accepted VolunteerApplication for the user, or None."""
    return (
        VolunteerApplication.objects.filter(
            user=user,
            status=VolunteerApplicationStatus.ACCEPTED,
        )
        .select_related('assigned_role')
        .prefetch_related('preferred_roles')
        .first()
    )


def _tasks_for_application(application):
    """Tasks visible to this volunteer: individual tasks + role-wide tasks for their role."""
    q = Q(application=application)
    if application.assigned_role_id:
        q |= Q(target_role=application.assigned_role, application__isnull=True)
    return VolunteerTask.objects.filter(q)


def _announcements_for_application(application):
    """Announcements for all volunteers + role-specific ones for this volunteer."""
    q = Q(target_role__isnull=True)
    if application.assigned_role_id:
        q |= Q(target_role=application.assigned_role)
    return VolunteerAnnouncement.objects.filter(q, is_published=True)


class VolunteerPortalSummaryView(APIView):
    """Dashboard summary: application info, task counts, and latest announcements."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        application = _get_accepted_application(request.user)
        if application is None:
            return Response(
                {'error': {'code': 'NOT_ACCEPTED', 'message': 'Volunteer portal is only available to accepted volunteers.'}},
                status=status.HTTP_403_FORBIDDEN,
            )
        tasks = _tasks_for_application(application)
        task_summary = {
            'pending': tasks.filter(status='pending').count(),
            'in_progress': tasks.filter(status='in_progress').count(),
            'done': tasks.filter(status='done').count(),
        }
        recent_announcements = _announcements_for_application(application).select_related('target_role')[:5]
        return Response({
            'data': {
                'application': VolunteerApplicationSerializer(application).data,
                'task_summary': task_summary,
                'recent_announcements': VolunteerAnnouncementSerializer(recent_announcements, many=True).data,
            }
        })


class VolunteerPortalTaskListView(APIView):
    """List all tasks for the authenticated accepted volunteer."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        application = _get_accepted_application(request.user)
        if application is None:
            return Response(
                {'error': {'code': 'NOT_ACCEPTED', 'message': 'Volunteer portal is only available to accepted volunteers.'}},
                status=status.HTTP_403_FORBIDDEN,
            )
        tasks = _tasks_for_application(application)
        return Response({'data': VolunteerTaskSerializer(tasks, many=True).data})


class VolunteerPortalTaskUpdateView(APIView):
    """Volunteer marks their own task as pending or done."""

    permission_classes = [IsAuthenticated]

    def patch(self, request, task_id):
        application = _get_accepted_application(request.user)
        if application is None:
            return Response(
                {'error': {'code': 'NOT_ACCEPTED', 'message': 'Volunteer portal is only available to accepted volunteers.'}},
                status=status.HTTP_403_FORBIDDEN,
            )
        task = get_object_or_404(_tasks_for_application(application), id=task_id)
        serializer = VolunteerTaskSerializer(task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'data': serializer.data})


class VolunteerPortalAnnouncementListView(APIView):
    """List published announcements visible to the authenticated accepted volunteer."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        application = _get_accepted_application(request.user)
        if application is None:
            return Response(
                {'error': {'code': 'NOT_ACCEPTED', 'message': 'Volunteer portal is only available to accepted volunteers.'}},
                status=status.HTTP_403_FORBIDDEN,
            )
        announcements = _announcements_for_application(application).select_related('target_role')
        return Response({'data': VolunteerAnnouncementSerializer(announcements, many=True).data})
