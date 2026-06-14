import logging

from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
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
from apps.accounts.models import ParticipantInvite, ParticipantInviteType
from apps.outreach.models import SpeakerApplication, SpeakerApplicationStatus
from apps.outreach.serializers import (
    OutreachOptionsSerializer,
    SpeakerApplicationCreateSerializer,
    SpeakerApplicationSerializer,
    SponsorInquiryCreateSerializer,
    SponsorInquirySerializer,
    TicketWaitlistCreateSerializer,
    TicketWaitlistSerializer,
    NewsletterSubscriberCreateSerializer,
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


def _user_needs_speaker_onboarding(user):
    has_invite = ParticipantInvite.objects.filter(
        user=user,
        invite_type=ParticipantInviteType.SPEAKER,
        accepted_at__isnull=False,
    ).exists()
    if not has_invite:
        return False
    app = SpeakerApplication.objects.filter(user=user).first()
    return app is None


class SpeakerApplicationMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        application = SpeakerApplication.objects.filter(user=request.user).first()
        return Response({
            'data': SpeakerApplicationSerializer(application).data if application else None,
            'meta': {
                'has_application': application is not None,
                'can_apply': application is None,
                'needs_onboarding': _user_needs_speaker_onboarding(request.user),
            },
        })


class SpeakerApplicationCreateView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedAnonRateThrottle]
    throttle_scope = 'public_form'
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        if SpeakerApplication.objects.filter(user=request.user).exists():
            return Response(
                {
                    'error': {
                        'code': 'APPLICATION_EXISTS',
                        'message': 'You have already submitted a speaker application.',
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = SpeakerApplicationCreateSerializer(
            data=request.data,
            context={'request': request},
        )
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


class NewsletterSubscribeView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedAnonRateThrottle]
    throttle_scope = 'public_form'

    def post(self, request):
        serializer = NewsletterSubscriberCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        subscriber = serializer.save()
        logger.info('newsletter_subscribed id=%s email=%s', subscriber.id, subscriber.email)
        monitor_event(
            'newsletter_subscribed',
            email=subscriber.email,
        )
        return Response(
            {'data': {'email': subscriber.email, 'status': subscriber.status}},
            status=status.HTTP_201_CREATED,
        )
