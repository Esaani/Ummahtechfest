from django.urls import path
import apps.payments.views as views

from apps.payments.views import (
    DonationCreateView,
    InitializePassPaymentView,
    PaystackWebhookView,
    VerifyPaymentView,
    AdminWithdrawalListView,
    AdminWithdrawalApproveView,
)

urlpatterns = [
    path('initialize/', InitializePassPaymentView.as_view(), name='payments-initialize'),
    path('verify/<str:reference>/', VerifyPaymentView.as_view(), name='payments-verify'),
    path('donations/', DonationCreateView.as_view(), name='payments-donations'),
    path('webhook/paystack/', PaystackWebhookView.as_view(), name='payments-webhook-paystack'),
    path('admin/withdrawals/', AdminWithdrawalListView.as_view(), name='admin-withdrawals-list'),
    path('admin/withdrawals/<uuid:pk>/approve/', AdminWithdrawalApproveView.as_view(), name='admin-withdrawals-approve'),

    # New Finance Endpoints
    path('admin/finance/overview/', views.AdminFinanceOverviewView.as_view(), name='admin-finance-overview'),
    path('admin/finance/wallets/', views.FinanceWalletListCreateView.as_view(), name='admin-finance-wallets-list'),
    path('admin/finance/wallets/<uuid:pk>/', views.FinanceWalletDetailView.as_view(), name='admin-finance-wallets-detail'),
    path('admin/finance/bills/', views.FinanceBillListCreateView.as_view(), name='admin-finance-bills-list'),
    path('admin/finance/bills/<uuid:pk>/', views.FinanceBillDetailView.as_view(), name='admin-finance-bills-detail'),
    path('admin/finance/expenses/', views.FinanceExpenseListCreateView.as_view(), name='admin-finance-expenses-list'),
    path('admin/finance/expenses/<uuid:pk>/', views.FinanceExpenseDetailView.as_view(), name='admin-finance-expenses-detail'),
    path('admin/finance/goals/', views.FinanceGoalListCreateView.as_view(), name='admin-finance-goals-list'),
    path('admin/finance/goals/<uuid:pk>/', views.FinanceGoalDetailView.as_view(), name='admin-finance-goals-detail'),
]
