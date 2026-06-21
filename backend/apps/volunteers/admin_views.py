from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.volunteers.models import (
    VolunteerAnnouncement,
    VolunteerApplication,
    VolunteerApplicationStatus,
    VolunteerApplicationStatusHistory,
    VolunteerRole,
    VolunteerTask,
)
from apps.volunteers.serializers import (
    VolunteerAnnouncementAdminSerializer,
    VolunteerApplicationAdminSerializer,
    VolunteerTaskAdminSerializer,
)
from common.admin_roles import PERM_SUBMISSIONS_MANAGE
from common.email_service import send_templated_email
from common.permissions import HasAdminPermission


class AdminVolunteerApplicationListView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def get(self, request):
        qs = (
            VolunteerApplication.objects.select_related(
                'user', 'assigned_role', 'profile_image_asset', 'cv_asset'
            )
            .prefetch_related('preferred_roles')
            .order_by('-created_at')
        )
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return Response({
            'data': VolunteerApplicationAdminSerializer(
                qs, many=True, context={'request': request}
            ).data,
        })


class AdminVolunteerApplicationDetailView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def get(self, request, application_id):
        application = get_object_or_404(
            VolunteerApplication.objects.select_related(
                'user', 'assigned_role', 'profile_image_asset', 'cv_asset'
            ).prefetch_related(
                'preferred_roles', 'status_history',
            ),
            id=application_id,
        )
        return Response({
            'data': VolunteerApplicationAdminSerializer(
                application, context={'request': request}
            ).data
        })

    def patch(self, request, application_id):
        application = get_object_or_404(
            VolunteerApplication.objects.select_related('user').prefetch_related('preferred_roles'),
            id=application_id,
        )
        old_status = application.status
        serializer = VolunteerApplicationAdminSerializer(
            application,
            data=request.data,
            partial=True,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        application = serializer.save()
        if application.status != old_status:
            VolunteerApplicationStatusHistory.objects.create(
                application=application,
                from_status=old_status,
                to_status=application.status,
                changed_by=request.user,
                note=request.data.get('status_note', ''),
            )
            # Send notification
            send_templated_email(
                'submission_status_updated',
                application.user.email,
                {
                    'name': application.user.full_name or application.user.email,
                    'submission_type': 'Volunteer Application',
                    'status_label': application.get_status_display(),
                    'message': request.data.get('status_note'),
                },
            )
        application = (
            VolunteerApplication.objects.select_related(
                'user', 'assigned_role', 'profile_image_asset', 'cv_asset'
            )
            .prefetch_related('preferred_roles', 'status_history')
            .get(id=application.id)
        )
        return Response({
            'data': VolunteerApplicationAdminSerializer(
                application, context={'request': request}
            ).data
        })


class AdminVolunteerRoleListView(APIView):
    """Active volunteer roles for assigning on applications."""

    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def get(self, request):
        roles = VolunteerRole.objects.filter(is_active=True).order_by('name')
        from apps.volunteers.serializers import VolunteerRoleSerializer

        return Response({'data': VolunteerRoleSerializer(roles, many=True).data})


# ── Volunteer Portal Admin ────────────────────────────────────────────────────

class AdminAcceptedVolunteerListView(APIView):
    """Accepted volunteers for task assignment dropdowns."""

    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def get(self, request):
        apps = (
            VolunteerApplication.objects.filter(status=VolunteerApplicationStatus.ACCEPTED)
            .select_related('user', 'assigned_role')
            .order_by('user__first_name', 'user__last_name')
        )
        data = [
            {
                'id': str(a.id),
                'name': a.user.full_name or a.user.email,
                'email': a.user.email,
                'assigned_role': a.assigned_role.name if a.assigned_role else None,
            }
            for a in apps
        ]
        return Response({'data': data})


class AdminVolunteerTaskListView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def get(self, request):
        qs = (
            VolunteerTask.objects.select_related(
                'application__user', 'target_role', 'assigned_by'
            )
            .order_by('status', '-created_at')
        )
        role_id = request.query_params.get('role')
        app_id = request.query_params.get('application')
        task_status = request.query_params.get('status')
        if role_id:
            qs = qs.filter(target_role_id=role_id)
        if app_id:
            qs = qs.filter(application_id=app_id)
        if task_status:
            qs = qs.filter(status=task_status)
        return Response({'data': VolunteerTaskAdminSerializer(qs, many=True).data})

    def post(self, request):
        serializer = VolunteerTaskAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = serializer.save(assigned_by=request.user)
        task = VolunteerTask.objects.select_related('application__user', 'target_role').get(id=task.id)
        return Response(
            {'data': VolunteerTaskAdminSerializer(task).data},
            status=status.HTTP_201_CREATED,
        )


class AdminVolunteerTaskDetailView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def _get_task(self, task_id):
        return get_object_or_404(
            VolunteerTask.objects.select_related('application__user', 'target_role', 'assigned_by'),
            id=task_id,
        )

    def get(self, request, task_id):
        return Response({'data': VolunteerTaskAdminSerializer(self._get_task(task_id)).data})

    def patch(self, request, task_id):
        task = self._get_task(task_id)
        serializer = VolunteerTaskAdminSerializer(task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        task = serializer.save()
        task = VolunteerTask.objects.select_related('application__user', 'target_role').get(id=task.id)
        return Response({'data': VolunteerTaskAdminSerializer(task).data})

    def delete(self, request, task_id):
        self._get_task(task_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminVolunteerAnnouncementListView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def get(self, request):
        qs = VolunteerAnnouncement.objects.select_related('target_role', 'posted_by').order_by('-created_at')
        return Response({'data': VolunteerAnnouncementAdminSerializer(qs, many=True).data})

    def post(self, request):
        serializer = VolunteerAnnouncementAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        announcement = serializer.save(posted_by=request.user)
        announcement = VolunteerAnnouncement.objects.select_related('target_role', 'posted_by').get(id=announcement.id)
        return Response(
            {'data': VolunteerAnnouncementAdminSerializer(announcement).data},
            status=status.HTTP_201_CREATED,
        )


class AdminVolunteerAnnouncementDetailView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def _get(self, announcement_id):
        return get_object_or_404(
            VolunteerAnnouncement.objects.select_related('target_role', 'posted_by'),
            id=announcement_id,
        )

    def get(self, request, announcement_id):
        return Response({'data': VolunteerAnnouncementAdminSerializer(self._get(announcement_id)).data})

    def patch(self, request, announcement_id):
        obj = self._get(announcement_id)
        serializer = VolunteerAnnouncementAdminSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        obj = VolunteerAnnouncement.objects.select_related('target_role', 'posted_by').get(id=obj.id)
        return Response({'data': VolunteerAnnouncementAdminSerializer(obj).data})

    def delete(self, request, announcement_id):
        self._get(announcement_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
