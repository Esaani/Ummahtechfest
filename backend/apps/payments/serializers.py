from decimal import Decimal

from django.conf import settings
from rest_framework import serializers

from apps.payments.models import Donation, Payment, PaymentPurpose, PaymentStatus, WithdrawalRequest, WithdrawalStatus
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


class WithdrawalRequestSerializer(serializers.ModelSerializer):
    requested_by_email = serializers.CharField(source='requested_by.email', read_only=True)
    approved_by_email = serializers.CharField(source='approved_by.email', read_only=True)

    class Meta:
        model = WithdrawalRequest
        fields = [
            'id',
            'requested_by',
            'requested_by_email',
            'amount',
            'method',
            'account_name',
            'account_number',
            'bank_or_network',
            'status',
            'approved_by',
            'approved_by_email',
            'proof_notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class WithdrawalRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WithdrawalRequest
        fields = [
            'amount',
            'method',
            'account_name',
            'account_number',
            'bank_or_network',
        ]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be greater than zero.')
        return value


class WithdrawalRequestApproveSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[WithdrawalStatus.APPROVED, WithdrawalStatus.REJECTED])
    proof_notes = serializers.CharField(allow_blank=True, required=False)

    def validate(self, attrs):
        status = attrs.get('status')
        proof_notes = attrs.get('proof_notes', '')
        if status == WithdrawalStatus.APPROVED and not proof_notes:
            raise serializers.ValidationError({'proof_notes': 'Proof notes are required when approving.'})
        return attrs


from apps.payments.models import FinanceWallet, FinanceBill, FinanceExpense, FinanceGoal

class FinanceWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinanceWallet
        fields = '__all__'


class FinanceBillSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinanceBill
        fields = '__all__'


class FinanceExpenseSerializer(serializers.ModelSerializer):
    wallet_name = serializers.CharField(source='wallet_used.name', read_only=True)

    class Meta:
        model = FinanceExpense
        fields = '__all__'


class FinanceGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinanceGoal
        fields = '__all__'
