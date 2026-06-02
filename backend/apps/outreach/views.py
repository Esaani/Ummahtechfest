import logging

from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cms.sponsorship import inquiry_tier_options
from apps.outreach.models import (
    SpeakerSessionFormat,
    SpeakerTrack,
    TicketWaitlistTier,
)
from common.tasks import send_email_task
from common.telegram_monitor import monitor_event
from common.throttling import ScopedAnonRateThrottle
from apps.outreach.serializers import (
    OutreachOptionsSerializer,
    SpeakerApplicationCreateSerializer,
    SpeakerApplicationSerializer,
    SponsorInquiryCreateSerializer,
    SponsorInquirySerializer,
    TicketWaitlistCreateSerializer,
    TicketWaitlistSerializer,
)

logger = logging.getLogger('ummah_tech_fest')


def _choice_options(choices):
    return [{'value': v, 'label': label} for v, label in choices.choices]


class OutreachOptionsView(APIView):
    """Tracks, formats, and tier options for sponsor / speaker / waitlist forms."""

    permission_classes = [AllowAny]

    def get(self, request):
        data = {
            'sponsor_tiers': inquiry_tier_options(),
            'speaker_tracks': _choice_options(SpeakerTrack),
            'speaker_formats': _choice_options(SpeakerSessionFormat),
            'ticket_waitlist_tiers': _choice_options(TicketWaitlistTier),
        }
        return Response({'data': OutreachOptionsSerializer(data).data})


class SponsorInquiryCreateView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedAnonRateThrottle]
    throttle_scope = 'public_form'

    def post(self, request):
        serializer = SponsorInquiryCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry = serializer.save()
        logger.info('sponsor_inquiry_created id=%s email=%s', inquiry.id, inquiry.email)
        monitor_event(
            'sponsor_inquiry_created',
            email=inquiry.email,
            company=inquiry.company_name,
            name=inquiry.full_name,
        )
        send_email_task.delay(
            'sponsor_inquiry_received',
            inquiry.email,
            {'full_name': inquiry.full_name, 'company_name': inquiry.company_name},
        )
        return Response(
            {'data': SponsorInquirySerializer(inquiry).data},
            status=status.HTTP_201_CREATED,
        )


class SpeakerApplicationCreateView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedAnonRateThrottle]
    throttle_scope = 'public_form'
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = SpeakerApplicationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = serializer.save()
        logger.info('speaker_application_created id=%s email=%s', application.id, application.email)
        monitor_event(
            'speaker_application_created',
            email=application.email,
            name=application.full_name,
            session=application.session_title,
        )
        send_email_task.delay(
            'speaker_application_received',
            application.email,
            {'full_name': application.full_name, 'session_title': application.session_title},
        )
        return Response(
            {'data': SpeakerApplicationSerializer(application).data},
            status=status.HTTP_201_CREATED,
        )


class TicketWaitlistCreateView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedAnonRateThrottle]
    throttle_scope = 'public_form'

    def post(self, request):
        serializer = TicketWaitlistCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        entry = serializer.save()
        logger.info('ticket_waitlist_created id=%s email=%s', entry.id, entry.email)
        monitor_event(
            'ticket_waitlist_joined',
            email=entry.email,
            name=entry.full_name,
        )
        send_email_task.delay(
            'ticket_waitlist_received',
            entry.email,
            {'full_name': entry.full_name},
        )
        return Response(
            {'data': TicketWaitlistSerializer(entry).data},
            status=status.HTTP_201_CREATED,
        )
