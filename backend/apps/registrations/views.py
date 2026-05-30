import logging

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.registrations.models import PassRegistration, PassType
from common.tasks import send_email_task
from apps.registrations.serializers import (
    OpenPassRegistrationSerializer,
    PassRegistrationSerializer,
    PassTypeAdminSerializer,
    PassTypeSerializer,
    SpecialAccessRegistrationSerializer,
)
from common.admin_roles import PERM_CMS_MANAGE
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
