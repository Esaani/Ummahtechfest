import logging

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.serializers import (
    AdminUserSerializer,
    StaffInviteAcceptSerializer,
    StaffInviteCreateSerializer,
    UserSerializer,
)
from apps.accounts.services.staff_invite import StaffInviteError, accept_staff_invite, create_staff_invite
from common.admin_roles import PERM_USERS_MANAGE
from common.permissions import HasAdminPermission

logger = logging.getLogger('ummah_tech_fest')
User = get_user_model()


class AdminUserListView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_USERS_MANAGE

    def get(self, request):
        qs = User.objects.filter(Q(is_superuser=True) | Q(admin_role__isnull=False)).order_by('-created_at')
        if request.query_params.get('staff') == '1':
            qs = qs.filter(is_superuser=False, admin_role__isnull=False)
        return Response({'data': AdminUserSerializer(qs, many=True).data})


class AdminUserDetailView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_USERS_MANAGE

    def patch(self, request, user_id):
        target = get_object_or_404(User, id=user_id)
        if target.is_superuser and not request.user.is_superuser:
            return Response(
                {'error': {'code': 'FORBIDDEN', 'message': 'Only superadmins can modify superadmin accounts.'}},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = AdminUserSerializer(target, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        logger.info('admin_user_updated target_id=%s by=%s', user.id, request.user.id)
        return Response({'data': AdminUserSerializer(user).data})


class AdminStaffInviteView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_USERS_MANAGE

    def post(self, request):
        serializer = StaffInviteCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        try:
            invite, user = create_staff_invite(
                serializer.validated_data['email'],
                serializer.validated_data['admin_role'],
                request.user,
            )
        except StaffInviteError as exc:
            return Response(
                {'error': {'code': exc.code, 'message': exc.message}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({
            'data': AdminUserSerializer(user).data,
            'meta': {'invite_id': str(invite.id), 'message': 'Invitation email sent.'},
        }, status=status.HTTP_201_CREATED)


class StaffInviteAcceptView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = StaffInviteAcceptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = accept_staff_invite(
                serializer.validated_data['invite_id'],
                serializer.validated_data['token'],
                serializer.validated_data['password'],
            )
        except StaffInviteError as exc:
            return Response(
                {'error': {'code': exc.code, 'message': exc.message}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        refresh = RefreshToken.for_user(user)
        return Response({
            'data': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
        })
