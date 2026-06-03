import uuid

from django.conf import settings
from django.db import models

from common.models import BaseModel


class PaymentProvider(models.TextChoices):
    PAYSTACK = 'paystack', 'Paystack'


class PaymentPurpose(models.TextChoices):
    PASS_REGISTRATION = 'pass_registration', 'Pass registration'
    DONATION = 'donation', 'Donation'


class PaymentStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    SUCCESS = 'success', 'Success'
    FAILED = 'failed', 'Failed'
    ABANDONED = 'abandoned', 'Abandoned'


def generate_payment_reference():
    return f'utf_{uuid.uuid4().hex}'


class Payment(BaseModel):
    reference = models.CharField(max_length=64, unique=True, default=generate_payment_reference)
    provider = models.CharField(max_length=32, choices=PaymentProvider.choices)
    provider_reference = models.CharField(max_length=128, blank=True)
    purpose = models.CharField(max_length=32, choices=PaymentPurpose.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='GHS')
    status = models.CharField(
        max_length=32,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
    )
    email = models.EmailField()
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments',
        db_column='user_id',
    )
    pass_registration = models.ForeignKey(
        'registrations.PassRegistration',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments',
        db_column='pass_registration_id',
    )
    metadata = models.JSONField(default=dict, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    provider_verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payments'
        indexes = [
            models.Index(fields=['reference']),
            models.Index(fields=['status', 'purpose']),
        ]

    def __str__(self):
        return f'{self.reference} ({self.status})'


class Donation(BaseModel):
    payment = models.OneToOneField(
        Payment,
        on_delete=models.CASCADE,
        related_name='donation',
        db_column='payment_id',
    )
    donor_name = models.CharField(max_length=200)
    donor_email = models.EmailField()
    message = models.TextField(blank=True)
    is_anonymous = models.BooleanField(default=False)

    class Meta:
        db_table = 'donations'

    def __str__(self):
        return f'{self.donor_name} — {self.payment.reference}'
