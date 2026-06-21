from django.contrib.auth import get_user_model
from rest_framework import serializers

from common.security import HoneypotSerializerMixin
from common.media_urls import public_media_url
from apps.cms.models import MediaAsset
from apps.volunteers.constants import WITHDRAWABLE_STATUSES
from apps.volunteers.models import (
    VolunteerAnnouncement,
    VolunteerApplication,
    VolunteerApplicationStatus,
    VolunteerRole,
    VolunteerTask,
    VolunteerTaskStatus,
)


def _create_volunteer_asset(uploaded, folder):
    import mimetypes
    mime, _ = mimetypes.guess_type(uploaded.name)
    return MediaAsset.objects.create(
        title=uploaded.name,
        folder=folder,
        file=uploaded,
        mime_type=mime or getattr(uploaded, 'content_type', '') or '',
        file_size=uploaded.size,
        is_private=True,
    )


class VolunteerRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerRole
        fields = ['id', 'slug', 'name', 'category', 'description']


class VolunteerApplicationSerializer(HoneypotSerializerMixin, serializers.ModelSerializer):
    preferred_role_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False,
    )
    preferred_roles = VolunteerRoleSerializer(many=True, read_only=True)
    assigned_role = VolunteerRoleSerializer(read_only=True)
    can_withdraw = serializers.SerializerMethodField()
    cv = serializers.FileField(write_only=True, required=True)
    profile_photo = serializers.FileField(write_only=True, required=True)

    class Meta:
        model = VolunteerApplication
        fields = [
            'id', 'status', 'phone', 'city', 'country', 'occupation', 'skills_summary', 'motivation',
            'availability', 'experience_years', 'portfolio_url', 'linkedin_url',
            'code_of_conduct_accepted', 'preferred_role_ids', 'preferred_roles',
            'assigned_role', 'can_withdraw', 'cv', 'profile_photo', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'status', 'preferred_roles', 'assigned_role', 'can_withdraw',
            'created_at', 'updated_at',
        ]

    def get_can_withdraw(self, obj):
        return obj.can_withdraw

    def validate_code_of_conduct_accepted(self, value):
        if not value:
            raise serializers.ValidationError('You must accept the code of conduct.')
        return value

    def validate_preferred_role_ids(self, value):
        if not value:
            return value
        count = VolunteerRole.objects.filter(id__in=value, is_active=True).count()
        if count != len(set(value)):
            raise serializers.ValidationError('One or more selected pathways are invalid.')
        return value

    def validate_cv(self, value):
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError('CV file must be 10MB or smaller.')
        return value

    def validate_profile_photo(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('Profile photo must be 5MB or smaller.')
        return value

    def create(self, validated_data):
        role_ids = validated_data.pop('preferred_role_ids', [])
        cv = validated_data.pop('cv', None)
        photo = validated_data.pop('profile_photo', None)
        user = self.context['request'].user
        if VolunteerApplication.objects.filter(user=user).exists():
            raise serializers.ValidationError(
                'You have already submitted a volunteer application. Each person may apply only once.'
            )

        if cv:
            validated_data['cv_asset'] = _create_volunteer_asset(cv, 'volunteer-applications/cvs')
        if photo:
            validated_data['profile_image_asset'] = _create_volunteer_asset(photo, 'volunteer-applications/photos')

        application = VolunteerApplication.objects.create(user=user, **validated_data)
        if role_ids:
            roles = VolunteerRole.objects.filter(id__in=role_ids)
            application.preferred_roles.set(roles)
        from apps.volunteers.models import VolunteerApplicationStatusHistory
        VolunteerApplicationStatusHistory.objects.create(
            application=application,
            from_status='',
            to_status=application.status,
            changed_by=user,
            note='Application submitted',
        )
        return application


class VolunteerApplicationUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name']
        read_only_fields = fields


class VolunteerApplicationAdminSerializer(serializers.ModelSerializer):
    preferred_roles = VolunteerRoleSerializer(many=True, read_only=True)
    assigned_role = VolunteerRoleSerializer(read_only=True)
    assigned_role_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    user = VolunteerApplicationUserSerializer(read_only=True)
    profile_image_url = serializers.SerializerMethodField()
    cv_url = serializers.SerializerMethodField()

    class Meta:
        model = VolunteerApplication
        fields = [
            'id', 'status', 'user', 'phone', 'city', 'country', 'occupation', 'skills_summary', 'motivation',
            'availability', 'experience_years', 'portfolio_url', 'linkedin_url',
            'preferred_roles', 'assigned_role', 'assigned_role_id', 'admin_notes',
            'profile_image_url', 'cv_url',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'user', 'preferred_roles', 'created_at', 'updated_at']

    def get_profile_image_url(self, obj):
        if not obj.profile_image_asset_id or not obj.profile_image_asset:
            return ''
        return public_media_url(obj.profile_image_asset.file, self.context.get('request'))

    def get_cv_url(self, obj):
        if not obj.cv_asset_id or not obj.cv_asset:
            return ''
        return public_media_url(obj.cv_asset.file, self.context.get('request'))

    def validate_assigned_role_id(self, value):
        if value is None:
            return value
        if not VolunteerRole.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError('Invalid volunteer role.')
        return value

    def update(self, instance, validated_data):
        role_id = validated_data.pop('assigned_role_id', serializers.empty)
        if role_id is not serializers.empty:
            if role_id is None:
                instance.assigned_role = None
            else:
                instance.assigned_role = VolunteerRole.objects.get(id=role_id)
        return super().update(instance, validated_data)


class VolunteerApplicationWithdrawSerializer(serializers.Serializer):
    def validate(self, attrs):
        app = self.context['application']
        if app.status not in WITHDRAWABLE_STATUSES:
            raise serializers.ValidationError(
                'This application can no longer be withdrawn because review has already started.'
            )
        return attrs


# ── Volunteer Portal ──────────────────────────────────────────────────────────

class VolunteerTaskSerializer(serializers.ModelSerializer):
    """Volunteer-facing task view. Only status is writable."""

    class Meta:
        model = VolunteerTask
        fields = ['id', 'title', 'description', 'due_label', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'title', 'description', 'due_label', 'created_at', 'updated_at']

    def validate_status(self, value):
        allowed = {VolunteerTaskStatus.PENDING, VolunteerTaskStatus.DONE}
        if value not in allowed:
            raise serializers.ValidationError('You may only mark a task as pending or done.')
        return value


class VolunteerAnnouncementSerializer(serializers.ModelSerializer):
    target_role_name = serializers.CharField(source='target_role.name', read_only=True, default=None)

    class Meta:
        model = VolunteerAnnouncement
        fields = ['id', 'title', 'body', 'target_role_name', 'created_at']
        read_only_fields = fields


# ── Admin Portal ──────────────────────────────────────────────────────────────

class VolunteerTaskAdminSerializer(serializers.ModelSerializer):
    application_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    target_role_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    volunteer_name = serializers.SerializerMethodField()
    target_role_name = serializers.CharField(source='target_role.name', read_only=True, default=None)

    class Meta:
        model = VolunteerTask
        fields = [
            'id', 'title', 'description', 'due_label', 'status',
            'application_id', 'target_role_id',
            'volunteer_name', 'target_role_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'volunteer_name', 'target_role_name', 'created_at', 'updated_at']

    def get_volunteer_name(self, obj):
        if obj.application_id and obj.application:
            user = obj.application.user
            return user.full_name or user.email
        return None

    def validate(self, attrs):
        app_id = attrs.get('application_id', serializers.empty)
        role_id = attrs.get('target_role_id', serializers.empty)
        # On create both must not be simultaneously set or both null
        if self.instance is None:
            has_app = app_id not in (serializers.empty, None)
            has_role = role_id not in (serializers.empty, None)
            if has_app and has_role:
                raise serializers.ValidationError('Set either application_id or target_role_id, not both.')
            if not has_app and not has_role:
                raise serializers.ValidationError('Set one of application_id or target_role_id.')
        return attrs

    def validate_application_id(self, value):
        if value is None:
            return value
        if not VolunteerApplication.objects.filter(id=value).exists():
            raise serializers.ValidationError('Volunteer application not found.')
        return value

    def validate_target_role_id(self, value):
        if value is None:
            return value
        if not VolunteerRole.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError('Volunteer role not found.')
        return value

    def create(self, validated_data):
        app_id = validated_data.pop('application_id', None)
        role_id = validated_data.pop('target_role_id', None)
        if app_id:
            validated_data['application'] = VolunteerApplication.objects.get(id=app_id)
        if role_id:
            validated_data['target_role'] = VolunteerRole.objects.get(id=role_id)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        app_id = validated_data.pop('application_id', serializers.empty)
        role_id = validated_data.pop('target_role_id', serializers.empty)
        if app_id is not serializers.empty:
            instance.application = VolunteerApplication.objects.get(id=app_id) if app_id else None
        if role_id is not serializers.empty:
            instance.target_role = VolunteerRole.objects.get(id=role_id) if role_id else None
        return super().update(instance, validated_data)


class VolunteerAnnouncementAdminSerializer(serializers.ModelSerializer):
    target_role_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    target_role_name = serializers.CharField(source='target_role.name', read_only=True, default=None)
    posted_by_name = serializers.SerializerMethodField()

    class Meta:
        model = VolunteerAnnouncement
        fields = [
            'id', 'title', 'body', 'is_published',
            'target_role_id', 'target_role_name',
            'posted_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'target_role_name', 'posted_by_name', 'created_at', 'updated_at']

    def get_posted_by_name(self, obj):
        if obj.posted_by_id and obj.posted_by:
            return obj.posted_by.full_name or obj.posted_by.email
        return None

    def validate_target_role_id(self, value):
        if value is None:
            return value
        if not VolunteerRole.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError('Volunteer role not found.')
        return value

    def create(self, validated_data):
        role_id = validated_data.pop('target_role_id', None)
        if role_id:
            validated_data['target_role'] = VolunteerRole.objects.get(id=role_id)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        role_id = validated_data.pop('target_role_id', serializers.empty)
        if role_id is not serializers.empty:
            instance.target_role = VolunteerRole.objects.get(id=role_id) if role_id else None
        return super().update(instance, validated_data)
