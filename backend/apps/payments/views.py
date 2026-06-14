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
    WithdrawalRequest,
    WithdrawalStatus,
)
from apps.payments.errors import payment_provider_error_response
from apps.payments.providers import PaymentProviderError, get_provider
from apps.payments.serializers import (
    DonationAdminSerializer,
    DonationCreateSerializer,
    PaymentSerializer,
    WithdrawalRequestSerializer,
    WithdrawalRequestCreateSerializer,
    WithdrawalRequestApproveSerializer,
)
from apps.payments.services import get_pass_price_ghs, mark_payment_failed, mark_payment_success
from apps.registrations.models import PassRegistration, PassRegistrationStatus
from common.permissions import HasAdminPermission
from common.admin_roles import PERM_SUBMISSIONS_MANAGE, PERM_FINANCE_MANAGE
from common.tasks import send_email_task
from common.telegram_monitor import monitor_event
from common.throttling import ScopedAnonRateThrottle, ScopedUserRateThrottle
from apps.accounts.models import User

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
            return payment_provider_error_response(
                exc,
                log_event='pass_payment_init_failed',
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
            return payment_provider_error_response(
                exc,
                log_event='payment_verify_failed',
                reference=reference,
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
            return payment_provider_error_response(
                exc,
                log_event='donation_init_failed',
                reference=payment.reference,
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


class AdminDonationListView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_SUBMISSIONS_MANAGE

    def get(self, request):
        qs = Donation.objects.select_related('payment').order_by('-created_at')
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(payment__status=status_filter)
        return Response({'data': DonationAdminSerializer(qs, many=True).data})


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


class AdminWithdrawalListView(APIView):
    permission_classes = [IsAuthenticated, HasAdminPermission]
    admin_permission = PERM_FINANCE_MANAGE

    def get(self, request):
        qs = WithdrawalRequest.objects.select_related('requested_by', 'approved_by')
        return Response({'data': WithdrawalRequestSerializer(qs, many=True).data})

    def post(self, request):
        serializer = WithdrawalRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        req = serializer.save(requested_by=request.user)

        # Notify all superadmins by email
        method_labels = {'momo': 'Mobile Money', 'bank': 'Bank Transfer'}
        admin_url = f'{_frontend_url("/admin/finance")}'
        email_context = {
            'requested_by_email': request.user.email,
            'amount': str(req.amount),
            'method_label': method_labels.get(req.method, req.method),
            'account_name': req.account_name,
            'account_number': req.account_number,
            'bank_or_network': req.bank_or_network,
            'admin_url': admin_url,
        }
        superadmin_emails = User.objects.filter(
            is_superuser=True, is_active=True,
        ).values_list('email', flat=True)
        for email in superadmin_emails:
            send_email_task.delay('withdrawal_request_pending', email, email_context)

        return Response(
            {'data': WithdrawalRequestSerializer(req).data},
            status=status.HTTP_201_CREATED,
        )


class AdminWithdrawalApproveView(APIView):
    permission_classes = [IsAuthenticated, HasAdminPermission]
    admin_permission = PERM_FINANCE_MANAGE

    def post(self, request, pk):
        if not request.user.is_superuser:
            return Response(
                {'error': {'code': 'FORBIDDEN', 'message': 'Only super admins can approve withdrawals.'}},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        req = WithdrawalRequest.objects.filter(pk=pk).first()
        if not req:
            return Response(
                {'error': {'code': 'NOT_FOUND', 'message': 'Withdrawal request not found.'}},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        if req.status != WithdrawalStatus.PENDING:
            return Response(
                {'error': {'code': 'INVALID_STATUS', 'message': 'Only pending requests can be approved/rejected.'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = WithdrawalRequestApproveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        req.status = serializer.validated_data['status']
        req.proof_notes = serializer.validated_data.get('proof_notes', '')
        req.approved_by = request.user
        req.save(update_fields=['status', 'proof_notes', 'approved_by', 'updated_at'])
        
        return Response({'data': WithdrawalRequestSerializer(req).data})


from rest_framework import generics
from django.db.models import Sum
from apps.payments.models import FinanceWallet, FinanceBill, FinanceExpense, FinanceGoal
from apps.payments.serializers import FinanceWalletSerializer, FinanceBillSerializer, FinanceExpenseSerializer, FinanceGoalSerializer

class AdminFinanceOverviewView(APIView):
    permission_classes = [IsAuthenticated, HasAdminPermission]
    admin_permission = PERM_FINANCE_MANAGE

    def get(self, request):
        total_revenue = Payment.objects.filter(status=PaymentStatus.SUCCESS).aggregate(Sum('amount'))['amount__sum'] or 0
        total_donations = Donation.objects.filter(payment__status=PaymentStatus.SUCCESS).aggregate(Sum('payment__amount'))['payment__amount__sum'] or 0
        total_passes = Payment.objects.filter(status=PaymentStatus.SUCCESS, purpose=PaymentPurpose.PASS_REGISTRATION).aggregate(Sum('amount'))['amount__sum'] or 0
        
        total_expenses = FinanceExpense.objects.aggregate(Sum('amount'))['amount__sum'] or 0
        total_bills_pending = FinanceBill.objects.exclude(status='paid').aggregate(Sum('amount'))['amount__sum'] or 0
        total_withdrawals = WithdrawalRequest.objects.filter(status=WithdrawalStatus.APPROVED).aggregate(Sum('amount'))['amount__sum'] or 0
        
        return Response({
            'data': {
                'total_revenue': str(total_revenue),
                'total_donations': str(total_donations),
                'total_passes': str(total_passes),
                'total_expenses': str(total_expenses),
                'total_bills_pending': str(total_bills_pending),
                'total_withdrawals': str(total_withdrawals),
                'current_balance': str(total_revenue - total_expenses - total_withdrawals),
            }
        })


class FinanceWalletListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, HasAdminPermission]
    admin_permission = PERM_FINANCE_MANAGE
    queryset = FinanceWallet.objects.all()
    serializer_class = FinanceWalletSerializer

class FinanceWalletDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, HasAdminPermission]
    admin_permission = PERM_FINANCE_MANAGE
    queryset = FinanceWallet.objects.all()
    serializer_class = FinanceWalletSerializer


class FinanceBillListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, HasAdminPermission]
    admin_permission = PERM_FINANCE_MANAGE
    queryset = FinanceBill.objects.all()
    serializer_class = FinanceBillSerializer

class FinanceBillDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, HasAdminPermission]
    admin_permission = PERM_FINANCE_MANAGE
    queryset = FinanceBill.objects.all()
    serializer_class = FinanceBillSerializer


class FinanceExpenseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, HasAdminPermission]
    admin_permission = PERM_FINANCE_MANAGE
    queryset = FinanceExpense.objects.all().select_related('wallet_used')
    serializer_class = FinanceExpenseSerializer

class FinanceExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, HasAdminPermission]
    admin_permission = PERM_FINANCE_MANAGE
    queryset = FinanceExpense.objects.all()
    serializer_class = FinanceExpenseSerializer


class FinanceGoalListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, HasAdminPermission]
    admin_permission = PERM_FINANCE_MANAGE
    queryset = FinanceGoal.objects.all()
    serializer_class = FinanceGoalSerializer

class FinanceGoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, HasAdminPermission]
    admin_permission = PERM_FINANCE_MANAGE
    queryset = FinanceGoal.objects.all()
    serializer_class = FinanceGoalSerializer

