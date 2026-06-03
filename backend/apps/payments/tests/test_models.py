from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.payments.models import Donation, Payment, PaymentPurpose, PaymentProvider, PaymentStatus
from apps.payments.services import mark_payment_success
from apps.registrations.models import PassFlow, PassRegistration, PassRegistrationStatus, PassType

User = get_user_model()


class PaymentModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='pay@example.com', password='SecurePass123!')
        self.pass_type = PassType.objects.create(slug='delegate', name='Delegate', flow=PassFlow.OPEN, price_ghs=750)
        self.reg = PassRegistration.objects.create(
            user=self.user,
            pass_type=self.pass_type,
            status=PassRegistrationStatus.PENDING_PAYMENT,
        )

    def test_create_payment_linked_to_registration(self):
        payment = Payment.objects.create(
            provider=PaymentProvider.PAYSTACK,
            purpose=PaymentPurpose.PASS_REGISTRATION,
            amount=Decimal('750.00'),
            email=self.user.email,
            user=self.user,
            pass_registration=self.reg,
        )
        self.assertTrue(payment.reference.startswith('utf_'))
        self.assertEqual(payment.status, PaymentStatus.PENDING)

    def test_mark_success_updates_registration(self):
        payment = Payment.objects.create(
            provider=PaymentProvider.PAYSTACK,
            purpose=PaymentPurpose.PASS_REGISTRATION,
            amount=Decimal('750.00'),
            email=self.user.email,
            user=self.user,
            pass_registration=self.reg,
        )
        mark_payment_success(payment, '12345', notify=False)
        self.reg.refresh_from_db()
        payment.refresh_from_db()
        self.assertEqual(payment.status, PaymentStatus.SUCCESS)
        self.assertEqual(self.reg.status, PassRegistrationStatus.PAID)

    def test_donation_one_to_one(self):
        payment = Payment.objects.create(
            provider=PaymentProvider.PAYSTACK,
            purpose=PaymentPurpose.DONATION,
            amount=Decimal('100.00'),
            email='donor@example.com',
        )
        donation = Donation.objects.create(
            payment=payment,
            donor_name='Amina',
            donor_email='donor@example.com',
            message='Barakallahu feek',
        )
        self.assertEqual(payment.donation.donor_name, 'Amina')
