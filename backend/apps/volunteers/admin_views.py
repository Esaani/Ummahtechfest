from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.volunteers.models import (
    VolunteerApplication,
    VolunteerApplicationStatusHistory,
    VolunteerRole,
)
from apps.volunteers.serializers import VolunteerApplicationAdminSerializer
from common.admin_roles import PERM_SUBMISSIONS_MANAGE
from common.permissions import HasAdminPermission


class AdminVolunteerApplicationListView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def get(self, request):
        qs = (
            VolunteerApplication.objects.select_related('user', 'assigned_role')
            .prefetch_related('preferred_roles')
            .order_by('-created_at')
        )
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return Response({
            'data': VolunteerApplicationAdminSerializer(qs, many=True).data,
        })


class AdminVolunteerApplicationDetailView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def get(self, request, application_id):
        application = get_object_or_404(
            VolunteerApplication.objects.select_related('user', 'assigned_role').prefetch_related(
                'preferred_roles', 'status_history',
            ),
            id=application_id,
        )
        return Response({'data': VolunteerApplicationAdminSerializer(application).data})

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
        application = (
            VolunteerApplication.objects.select_related('user', 'assigned_role')
            .prefetch_related('preferred_roles', 'status_history')
            .get(id=application.id)
        )
        return Response({'data': VolunteerApplicationAdminSerializer(application).data})


class AdminVolunteerRoleListView(APIView):
    """Active volunteer roles for assigning on applications."""

    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def get(self, request):
        roles = VolunteerRole.objects.filter(is_active=True).order_by('name')
        from apps.volunteers.serializers import VolunteerRoleSerializer

        return Response({'data': VolunteerRoleSerializer(roles, many=True).data})
