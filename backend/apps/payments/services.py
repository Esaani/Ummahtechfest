import logging
from decimal import Decimal

from django.conf import settings
from django.utils import timezone

from apps.payments.models import Payment, PaymentPurpose, PaymentStatus
from apps.registrations.models import PassRegistrationStatus
from common.tasks import send_email_task
from common.telegram_monitor import monitor_event

logger = logging.getLogger('ummah_tech_fest')

DONATION_MIN_GHS = Decimal('1')
DONATION_MAX_GHS = Decimal('50000')


def get_pass_price_ghs(pass_type) -> Decimal:
    """Resolve pass price from PassType.price_ghs or settings fallback."""
    if pass_type.price_ghs is not None and pass_type.price_ghs > 0:
        return pass_type.price_ghs
    defaults = getattr(settings, 'PASS_DEFAULT_PRICES_GHS', {})
    fallback = defaults.get(pass_type.slug)
    if fallback is not None:
        return Decimal(str(fallback))
    return Decimal(str(getattr(settings, 'PASS_DEFAULT_PRICE_GHS', '500')))


def mark_payment_success(payment: Payment, provider_reference: str = '', *, notify: bool = True) -> Payment:
    """Idempotently mark payment successful and fulfill linked resources."""
    if payment.status == PaymentStatus.SUCCESS:
        return payment

    payment.status = PaymentStatus.SUCCESS
    payment.provider_reference = provider_reference or payment.provider_reference
    payment.paid_at = timezone.now()
    payment.provider_verified_at = timezone.now()
    payment.save(
        update_fields=[
            'status',
            'provider_reference',
            'paid_at',
            'provider_verified_at',
            'updated_at',
        ],
    )

    if payment.purpose == PaymentPurpose.PASS_REGISTRATION and payment.pass_registration_id:
        reg = payment.pass_registration
        if reg and reg.status == PassRegistrationStatus.PENDING_PAYMENT:
            reg.status = PassRegistrationStatus.PAID
            reg.save(update_fields=['status', 'updated_at'])
            logger.info('pass_registration_paid registration_id=%s payment=%s', reg.id, payment.reference)

    if notify:
        _notify_payment_success(payment)

    return payment


def mark_payment_failed(payment: Payment) -> Payment:
    if payment.status in (PaymentStatus.SUCCESS, PaymentStatus.FAILED):
        return payment
    payment.status = PaymentStatus.FAILED
    payment.save(update_fields=['status', 'updated_at'])
    return payment


def _notify_payment_success(payment: Payment):
    if payment.purpose == PaymentPurpose.DONATION:
        donation = getattr(payment, 'donation', None)
        donor_name = donation.donor_name if donation else 'Donor'
        monitor_event(
            'donation_received',
            email=payment.email,
            amount=str(payment.amount),
            reference=payment.reference,
            donor=donor_name,
        )
        if donation and not donation.is_anonymous:
            send_email_task.delay(
                'donation_received',
                payment.email,
                {
                    'donor_name': donation.donor_name,
                    'amount': str(payment.amount),
                    'currency': payment.currency,
                },
            )
        return

    if payment.purpose == PaymentPurpose.PASS_REGISTRATION and payment.user_id:
        reg = payment.pass_registration
        pass_title = reg.pass_type.name if reg else 'Event pass'
        monitor_event(
            'pass_payment_received',
            email=payment.email,
            user_id=str(payment.user_id),
            amount=str(payment.amount),
            reference=payment.reference,
            pass_title=pass_title,
        )
        send_email_task.delay(
            'pass_payment_received',
            payment.email,
            {
                'first_name': payment.user.first_name or payment.email.split('@')[0],
                'pass_title': pass_title,
                'amount': str(payment.amount),
                'currency': payment.currency,
            },
        )
