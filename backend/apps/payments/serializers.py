from decimal import Decimal

from django.conf import settings
from rest_framework import serializers

from apps.payments.models import Donation, Payment, PaymentPurpose, PaymentStatus
from apps.payments.services import DONATION_MAX_GHS, DONATION_MIN_GHS
from common.security import HoneypotSerializerMixin


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id',
            'reference',
            'provider',
            'purpose',
            'amount',
            'currency',
            'status',
            'email',
            'paid_at',
            'created_at',
        ]
        read_only_fields = fields


class DonationAdminSerializer(serializers.ModelSerializer):
    payment_reference = serializers.CharField(source='payment.reference', read_only=True)
    amount = serializers.DecimalField(source='payment.amount', max_digits=10, decimal_places=2, read_only=True)
    currency = serializers.CharField(source='payment.currency', read_only=True)
    status = serializers.CharField(source='payment.status', read_only=True)
    status_label = serializers.CharField(source='payment.get_status_display', read_only=True)
    provider = serializers.CharField(source='payment.provider', read_only=True)
    provider_reference = serializers.CharField(source='payment.provider_reference', read_only=True)
    paid_at = serializers.DateTimeField(source='payment.paid_at', read_only=True)
    payment_created_at = serializers.DateTimeField(source='payment.created_at', read_only=True)

    class Meta:
        model = Donation
        fields = [
            'id',
            'donor_name',
            'donor_email',
            'message',
            'is_anonymous',
            'payment_reference',
            'amount',
            'currency',
            'status',
            'status_label',
            'provider',
            'provider_reference',
            'paid_at',
            'payment_created_at',
            'created_at',
        ]
        read_only_fields = fields


class DonationCreateSerializer(HoneypotSerializerMixin, serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=DONATION_MIN_GHS)
    donor_name = serializers.CharField(max_length=200)
    donor_email = serializers.EmailField()
    message = serializers.CharField(required=False, allow_blank=True, max_length=2000)
    is_anonymous = serializers.BooleanField(required=False, default=False)

    def validate_amount(self, value):
        if value > DONATION_MAX_GHS:
            raise serializers.ValidationError(
                f'Maximum donation amount is {DONATION_MAX_GHS} GHS.',
            )
        return value


class InitializePassPaymentSerializer(serializers.Serializer):
    """Optional body for pass payment init (provider override)."""

    provider = serializers.CharField(required=False, allow_blank=True)
