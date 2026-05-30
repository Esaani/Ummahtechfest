from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.outreach.models import SpeakerApplication, SponsorInquiry, TicketWaitlist
from apps.outreach.serializers import (
    SpeakerApplicationAdminSerializer,
    SponsorInquiryAdminSerializer,
    TicketWaitlistAdminSerializer,
)
from common.admin_roles import PERM_SUBMISSIONS_MANAGE
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
        serializer = SponsorInquiryAdminSerializer(inquiry, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        inquiry = serializer.save()
        return Response({'data': SponsorInquiryAdminSerializer(inquiry).data})


class AdminSpeakerApplicationListView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def get(self, request):
        qs = SpeakerApplication.objects.all().order_by('-created_at')
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return Response({
            'data': SpeakerApplicationAdminSerializer(qs, many=True).data,
        })


class AdminSpeakerApplicationDetailView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def get(self, request, application_id):
        application = get_object_or_404(SpeakerApplication, id=application_id)
        return Response({'data': SpeakerApplicationAdminSerializer(application).data})

    def patch(self, request, application_id):
        application = get_object_or_404(SpeakerApplication, id=application_id)
        serializer = SpeakerApplicationAdminSerializer(application, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        application = serializer.save()
        return Response({'data': SpeakerApplicationAdminSerializer(application).data})


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
        serializer = TicketWaitlistAdminSerializer(entry, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        entry = serializer.save()
        return Response({'data': TicketWaitlistAdminSerializer(entry).data})
