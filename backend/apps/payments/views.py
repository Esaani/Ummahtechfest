import logging

from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.payments.models import (
    Donation,
    Payment,
    PaymentProvider,
    PaymentPurpose,
    PaymentStatus,
)
from apps.payments.providers import PaymentProviderError, get_provider
from apps.payments.serializers import DonationCreateSerializer, PaymentSerializer
from apps.payments.services import get_pass_price_ghs, mark_payment_failed, mark_payment_success
from apps.registrations.models import PassRegistration, PassRegistrationStatus
from common.telegram_monitor import monitor_event
from common.throttling import ScopedAnonRateThrottle, ScopedUserRateThrottle

logger = logging.getLogger('ummah_tech_fest')


def _frontend_url(path: str) -> str:
    base = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    return f'{base}{path}'


def _default_provider_name() -> str:
    return getattr(settings, 'DEFAULT_PAYMENT_PROVIDER', PaymentProvider.PAYSTACK)


class InitializePassPaymentView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedUserRateThrottle]
    throttle_scope = 'authenticated_form'

    def post(self, request):
        reg = (
            PassRegistration.objects.filter(user=request.user)
            .select_related('pass_type')
            .first()
        )
        if not reg:
            return Response(
                {'error': {'code': 'NO_REGISTRATION', 'message': 'No pass registration found.'}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if reg.status != PassRegistrationStatus.PENDING_PAYMENT:
            return Response(
                {
                    'error': {
                        'code': 'INVALID_STATUS',
                        'message': 'This registration is not awaiting payment.',
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing = Payment.objects.filter(
            pass_registration=reg,
            purpose=PaymentPurpose.PASS_REGISTRATION,
            status=PaymentStatus.PENDING,
        ).first()
        if existing:
            payment = existing
        else:
            amount = get_pass_price_ghs(reg.pass_type)
            payment = Payment.objects.create(
                provider=_default_provider_name(),
                purpose=PaymentPurpose.PASS_REGISTRATION,
                amount=amount,
                currency='GHS',
                email=request.user.email,
                user=request.user,
                pass_registration=reg,
                metadata={'pass_slug': reg.pass_type.slug},
            )

        callback_url = _frontend_url(f'/payment/verify?reference={payment.reference}')
        try:
            provider = get_provider(payment.provider)
            result = provider.initialize(payment, callback_url)
        except PaymentProviderError as exc:
            logger.warning('pass_payment_init_failed ref=%s err=%s', payment.reference, exc)
            return Response(
                {'error': {'code': 'PAYMENT_INIT_FAILED', 'message': str(exc)}},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {
                'data': {
                    'authorization_url': result['authorization_url'],
                    'reference': payment.reference,
                    'amount': str(payment.amount),
                    'currency': payment.currency,
                },
            },
        )


class VerifyPaymentView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, reference):
        payment = Payment.objects.filter(reference=reference).select_related(
            'pass_registration',
            'pass_registration__pass_type',
            'donation',
            'user',
        ).first()
        if not payment:
            return Response(
                {'error': {'code': 'NOT_FOUND', 'message': 'Payment not found.'}},
                status=status.HTTP_404_NOT_FOUND,
            )

        if payment.purpose == PaymentPurpose.PASS_REGISTRATION:
            if not request.user.is_authenticated:
                return Response(
                    {'error': {'code': 'UNAUTHORIZED', 'message': 'Please log in to verify this payment.'}},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            if payment.user_id != request.user.id:
                return Response(
                    {'error': {'code': 'FORBIDDEN', 'message': 'You do not have access to this payment.'}},
                    status=status.HTTP_403_FORBIDDEN,
                )

        if payment.status == PaymentStatus.SUCCESS:
            return Response({'data': PaymentSerializer(payment).data})

        try:
            provider = get_provider(payment.provider)
            result = provider.verify(payment.reference)
        except PaymentProviderError as exc:
            return Response(
                {'error': {'code': 'VERIFY_FAILED', 'message': str(exc)}},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if result['status'] == 'success':
            mark_payment_success(payment, result.get('provider_reference', ''))
        else:
            mark_payment_failed(payment)

        payment.refresh_from_db()
        return Response({'data': PaymentSerializer(payment).data})


class DonationCreateView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedAnonRateThrottle]
    throttle_scope = 'public_form'

    def post(self, request):
        serializer = DonationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        payment = Payment.objects.create(
            provider=_default_provider_name(),
            purpose=PaymentPurpose.DONATION,
            amount=data['amount'],
            currency='GHS',
            email=data['donor_email'],
            metadata={'donor_name': data['donor_name']},
        )
        Donation.objects.create(
            payment=payment,
            donor_name=data['donor_name'],
            donor_email=data['donor_email'],
            message=data.get('message', ''),
            is_anonymous=data.get('is_anonymous', False),
        )

        callback_url = _frontend_url(f'/donate/verify?reference={payment.reference}')
        try:
            provider = get_provider(payment.provider)
            result = provider.initialize(payment, callback_url)
        except PaymentProviderError as exc:
            payment.status = PaymentStatus.FAILED
            payment.save(update_fields=['status', 'updated_at'])
            return Response(
                {'error': {'code': 'PAYMENT_INIT_FAILED', 'message': str(exc)}},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        monitor_event(
            'donation_initiated',
            email=data['donor_email'],
            amount=str(data['amount']),
            reference=payment.reference,
        )

        return Response(
            {
                'data': {
                    'authorization_url': result['authorization_url'],
                    'reference': payment.reference,
                    'amount': str(payment.amount),
                    'currency': payment.currency,
                },
            },
            status=status.HTTP_201_CREATED,
        )


@method_decorator(csrf_exempt, name='dispatch')
class PaystackWebhookView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        try:
            provider = get_provider(PaymentProvider.PAYSTACK)
            payload = provider.validate_webhook(request)
        except PaymentProviderError as exc:
            logger.warning('paystack_webhook_rejected err=%s', exc)
            return Response(
                {'error': {'code': 'INVALID_WEBHOOK', 'message': 'Invalid webhook.'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        event = payload.get('event', '')
        if event != 'charge.success':
            return Response({'data': {'received': True}})

        data = payload.get('data') or {}
        reference = data.get('reference', '')
        if not reference:
            return Response({'data': {'received': True}})

        payment = Payment.objects.filter(reference=reference).first()
        if not payment:
            logger.warning('paystack_webhook_unknown_ref reference=%s', reference)
            return Response({'data': {'received': True}})

        provider_ref = str(data.get('id', ''))
        mark_payment_success(payment, provider_ref)
        return Response({'data': {'received': True}})
