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
