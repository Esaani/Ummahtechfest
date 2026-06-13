from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.accounts.models import AdminRole, ParticipantInviteType, User
from apps.accounts.services import email_verification
from common.admin_roles import get_admin_permissions
from common.security import HoneypotSerializerMixin


class SendSignupOtpSerializer(HoneypotSerializerMixin, serializers.Serializer):
    email = serializers.EmailField()


class ConfirmSignupOtpSerializer(HoneypotSerializerMixin, serializers.Serializer):
    verification_id = serializers.UUIDField()
    code = serializers.CharField(min_length=6, max_length=6)


class ResendSignupOtpSerializer(HoneypotSerializerMixin, serializers.Serializer):
    verification_id = serializers.UUIDField()


class RegisterSerializer(HoneypotSerializerMixin, serializers.Serializer):
    signup_token = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        email, _verification = email_verification.validate_signup_token(attrs['signup_token'])
        attrs['email'] = email
        return attrs

    def create(self, validated_data):
        validated_data.pop('signup_token')
        return User.objects.create_user(**validated_data)


class LoginSerializer(HoneypotSerializerMixin, serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email', '').lower()
        try:
            user_obj = User.objects.get(email=email)
            if not user_obj.is_active:
                raise serializers.ValidationError({'non_field_errors': ['This account is deactivated.']})
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=attrs.get('password'),
            )
            if user is None:
                raise serializers.ValidationError({'non_field_errors': ['Incorrect password.']})
        except User.DoesNotExist:
            raise serializers.ValidationError({'non_field_errors': ['Email address not registered.']})
        
        attrs['user'] = user
        return attrs


class PasswordResetRequestSerializer(HoneypotSerializerMixin, serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(HoneypotSerializerMixin, serializers.Serializer):
    reset_id = serializers.UUIDField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': ['Passwords do not match.']})
        return attrs


class UserSerializer(serializers.ModelSerializer):
    admin_permissions = serializers.SerializerMethodField()
    admin_role_label = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'is_superuser', 'is_staff', 'admin_role', 'admin_role_label', 'admin_permissions',
            'created_at',
        ]
        read_only_fields = fields

    def get_admin_permissions(self, obj):
        return sorted(get_admin_permissions(obj))

    def get_admin_role_label(self, obj):
        if obj.is_superuser:
            return 'Superadmin'
        if obj.admin_role:
            return AdminRole(obj.admin_role).label
        return None


class StaffInviteCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    admin_role = serializers.ChoiceField(choices=AdminRole.choices)

    def validate_admin_role(self, value):
        request = self.context.get('request')
        if request and not request.user.is_superuser and value not in (
            AdminRole.CONTENT_MANAGER,
            AdminRole.SUBMISSIONS_REVIEWER,
            AdminRole.USER_MANAGER,
            AdminRole.OPERATIONS,
        ):
            pass  # all non-super roles allowed for user_manager
        return value


class StaffInviteAcceptSerializer(serializers.Serializer):
    invite_id = serializers.UUIDField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': ['Passwords do not match.']})
        return attrs


class ParticipantInviteCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    invite_type = serializers.ChoiceField(choices=ParticipantInviteType.choices)


class ParticipantInviteAcceptSerializer(serializers.Serializer):
    invite_id = serializers.UUIDField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': ['Passwords do not match.']})
        return attrs


class AdminUserSerializer(serializers.ModelSerializer):
    admin_role_label = serializers.SerializerMethodField()
    admin_permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'is_superuser', 'is_staff', 'is_active', 'admin_role', 'admin_role_label',
            'admin_permissions', 'created_at',
        ]
        read_only_fields = ['id', 'email', 'full_name', 'created_at', 'admin_permissions']

    def get_admin_role_label(self, obj):
        if obj.is_superuser:
            return 'Superadmin'
        if obj.admin_role:
            return AdminRole(obj.admin_role).label
        return None

    def get_admin_permissions(self, obj):
        return sorted(get_admin_permissions(obj))

    def validate(self, attrs):
        request = self.context.get('request')
        instance = self.instance
        if attrs.get('is_superuser') and request and not request.user.is_superuser:
            raise serializers.ValidationError(
                {'is_superuser': ['Only superadmins can grant superadmin access.']},
            )
        if instance and instance.is_superuser and 'admin_role' in attrs and attrs['admin_role']:
            raise serializers.ValidationError(
                {'admin_role': ['Superadmins do not use admin_role; clear the role instead.']},
            )
        return attrs

    def update(self, instance, validated_data):
        if validated_data.get('admin_role'):
            validated_data['is_staff'] = True
        if validated_data.get('admin_role') is None and 'admin_role' in validated_data:
            validated_data['is_staff'] = False
        if validated_data.get('is_superuser'):
            validated_data['admin_role'] = None
            validated_data['is_staff'] = True
        return super().update(instance, validated_data)
