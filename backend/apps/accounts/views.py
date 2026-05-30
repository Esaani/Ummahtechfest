import logging

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts.serializers import (
    ConfirmSignupOtpSerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    ResendSignupOtpSerializer,
    SendSignupOtpSerializer,
    UserSerializer,
)
from apps.accounts.services.password_reset import PasswordResetError, confirm_password_reset, request_password_reset
from apps.accounts.services.email_verification import (
    EmailVerificationError,
    confirm_signup_otp,
    resend_signup_otp,
    send_signup_otp,
)
from common.tasks import send_email_task
from common.telegram_monitor import monitor_event
from common.throttling import ScopedAnonRateThrottle

logger = logging.getLogger('ummah_tech_fest')


def _verification_error_response(exc):
    return Response(
        {'error': {'code': exc.code, 'message': exc.message}},
        status=status.HTTP_400_BAD_REQUEST,
    )


class SendSignupOtpView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedAnonRateThrottle]
    throttle_scope = 'otp_send'

    def post(self, request):
        serializer = SendSignupOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            verification = send_signup_otp(serializer.validated_data['email'])
        except EmailVerificationError as exc:
            return _verification_error_response(exc)
        return Response({
            'data': {
                'verification_id': str(verification.id),
                'email': verification.email,
                'expires_at': verification.expires_at.isoformat(),
            },
        })


class ConfirmSignupOtpView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedAnonRateThrottle]
    throttle_scope = 'otp_confirm'

    def post(self, request):
        serializer = ConfirmSignupOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            verification, signup_token = confirm_signup_otp(
                serializer.validated_data['verification_id'],
                serializer.validated_data['code'],
            )
        except EmailVerificationError as exc:
            return _verification_error_response(exc)
        return Response({
            'data': {
                'verification_id': str(verification.id),
                'email': verification.email,
                'signup_token': signup_token,
            },
        })


class ResendSignupOtpView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedAnonRateThrottle]
    throttle_scope = 'otp_resend'

    def post(self, request):
        serializer = ResendSignupOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            verification = resend_signup_otp(serializer.validated_data['verification_id'])
        except EmailVerificationError as exc:
            return _verification_error_response(exc)
        return Response({
            'data': {
                'verification_id': str(verification.id),
                'email': verification.email,
                'expires_at': verification.expires_at.isoformat(),
            },
        })


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedAnonRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        logger.info('user_registered user_id=%s', user.id)
        monitor_event('user_registered', email=user.email, user_id=str(user.id))
        send_email_task.delay(
            'welcome',
            user.email,
            {'first_name': user.first_name or user.email.split('@')[0]},
        )
        refresh = RefreshToken.for_user(user)
        return Response({
            'data': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedAnonRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        logger.info('user_logged_in user_id=%s', user.id)
        monitor_event('user_logged_in', email=user.email, user_id=str(user.id))
        return Response({
            'data': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh = request.data.get('refresh')
        if refresh:
            try:
                token = RefreshToken(refresh)
                token.blacklist()
            except Exception:
                pass
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'data': UserSerializer(request.user).data})


class RefreshTokenView(TokenRefreshView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedAnonRateThrottle]
    throttle_scope = 'auth'


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedAnonRateThrottle]
    throttle_scope = 'password_reset'

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request_password_reset(serializer.validated_data['email'])
        return Response({
            'data': {
                'message': (
                    'If an account exists for this email, you will receive password reset instructions shortly.'
                ),
            },
        })


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedAnonRateThrottle]
    throttle_scope = 'password_reset'

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            confirm_password_reset(
                serializer.validated_data['reset_id'],
                serializer.validated_data['token'],
                serializer.validated_data['password'],
            )
        except PasswordResetError as exc:
            return Response(
                {'error': {'code': exc.code, 'message': exc.message}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({
            'data': {'message': 'Your password has been updated. You can sign in now.'},
        })


