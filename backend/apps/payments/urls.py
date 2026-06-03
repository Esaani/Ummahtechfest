from django.urls import path

from apps.payments.views import (
    DonationCreateView,
    InitializePassPaymentView,
    PaystackWebhookView,
    VerifyPaymentView,
)

urlpatterns = [
    path('initialize/', InitializePassPaymentView.as_view(), name='payments-initialize'),
    path('verify/<str:reference>/', VerifyPaymentView.as_view(), name='payments-verify'),
    path('donations/', DonationCreateView.as_view(), name='payments-donations'),
    path('webhook/paystack/', PaystackWebhookView.as_view(), name='payments-webhook-paystack'),
]
