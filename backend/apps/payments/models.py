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


class WithdrawalMethod(models.TextChoices):
    MOMO = 'momo', 'Mobile Money'
    BANK = 'bank', 'Bank Transfer'


class WithdrawalStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    APPROVED = 'approved', 'Approved'
    REJECTED = 'rejected', 'Rejected'


class WithdrawalRequest(BaseModel):
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='withdrawal_requests_made',
        db_column='requested_by_id',
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=32, choices=WithdrawalMethod.choices)
    account_name = models.CharField(max_length=150)
    account_number = models.CharField(max_length=100)
    bank_or_network = models.CharField(max_length=150)
    status = models.CharField(
        max_length=32,
        choices=WithdrawalStatus.choices,
        default=WithdrawalStatus.PENDING,
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='withdrawal_requests_approved',
        db_column='approved_by_id',
    )
    proof_notes = models.TextField(blank=True)

    class Meta:
        db_table = 'withdrawal_requests'
        ordering = ['-created_at']

    def __str__(self):
        return f'Withdrawal {self.id} - {self.amount} ({self.status})'


class FinanceWallet(BaseModel):
    name = models.CharField(max_length=200)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'finance_wallets'

    def __str__(self):
        return f'{self.name} - GHS {self.balance}'


class BillStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    OVERDUE = 'overdue', 'Overdue'
    PAID = 'paid', 'Paid'


class FinanceBill(BaseModel):
    name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    category = models.CharField(max_length=150, blank=True)
    status = models.CharField(max_length=32, choices=BillStatus.choices, default=BillStatus.PENDING)
    paid_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'finance_bills'
        ordering = ['due_date']

    def __str__(self):
        return f'{self.name} - {self.amount} ({self.status})'


class FinanceExpense(BaseModel):
    name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    category = models.CharField(max_length=150, blank=True)
    wallet_used = models.ForeignKey(
        FinanceWallet,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='expenses'
    )
    receipt_notes = models.TextField(blank=True)

    class Meta:
        db_table = 'finance_expenses'
        ordering = ['-date']

    def __str__(self):
        return f'{self.name} - {self.amount}'


class FinanceGoal(BaseModel):
    name = models.CharField(max_length=200)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deadline = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'finance_goals'

    def __str__(self):
        return f'{self.name} - {self.current_amount}/{self.target_amount}'
