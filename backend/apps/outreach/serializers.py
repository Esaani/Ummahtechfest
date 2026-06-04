import mimetypes

from rest_framework import serializers

from apps.cms.models import MediaAsset
from apps.cms.sponsorship import inquiry_tier_slugs, tier_label_for_slug
from apps.outreach.models import (
    SpeakerApplication,
    SpeakerApplicationSource,
    SpeakerApplicationStatus,
    SpeakerSessionFormat,
    SpeakerTrack,
    SponsorInquiry,
    SponsorInquiryStatus,
    TicketWaitlist,
    TicketWaitlistStatus,
    TicketWaitlistTier,
)
from common.form_validators import (
    validate_email_field,
    validate_optional_url,
    validate_person_name,
)
from common.media_urls import public_media_url
from common.security import HoneypotSerializerMixin


def _create_speaker_profile_asset(uploaded):
    mime, _ = mimetypes.guess_type(uploaded.name)
    return MediaAsset.objects.create(
        title=uploaded.name,
        folder='speaker-applications/photos',
        file=uploaded,
        mime_type=mime or getattr(uploaded, 'content_type', '') or '',
        file_size=uploaded.size,
    )


def _create_speaker_cv_asset(uploaded):
    mime, _ = mimetypes.guess_type(uploaded.name)
    return MediaAsset.objects.create(
        title=uploaded.name,
        folder='speaker-applications/cvs',
        file=uploaded,
        mime_type=mime or getattr(uploaded, 'content_type', '') or '',
        file_size=uploaded.size,
    )


class SponsorInquiryCreateSerializer(HoneypotSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = SponsorInquiry
        fields = ['full_name', 'company_name', 'email', 'tier_interest', 'requirements']

    def validate_full_name(self, value):
        return validate_person_name(value, 'Full name')

    def validate_company_name(self, value):
        value = (value or '').strip()
        if len(value) < 2:
            raise serializers.ValidationError('Company name must be at least 2 characters.')
        return value

    def validate_email(self, value):
        return validate_email_field(value)

    def validate_tier_interest(self, value):
        if value not in inquiry_tier_slugs():
            raise serializers.ValidationError('Invalid sponsorship tier.')
        return value

    def validate_requirements(self, value):
        return (value or '').strip()[:5000]


class SponsorInquirySerializer(serializers.ModelSerializer):
    tier_interest_label = serializers.SerializerMethodField()

    class Meta:
        model = SponsorInquiry
        fields = [
            'id', 'full_name', 'company_name', 'email', 'tier_interest',
            'tier_interest_label', 'requirements', 'status', 'created_at',
        ]
        read_only_fields = fields

    def get_tier_interest_label(self, obj):
        return tier_label_for_slug(obj.tier_interest)


class SponsorInquiryAdminSerializer(serializers.ModelSerializer):
    tier_interest_label = serializers.SerializerMethodField()

    class Meta:
        model = SponsorInquiry
        fields = [
            'id', 'full_name', 'company_name', 'email', 'tier_interest',
            'tier_interest_label', 'requirements', 'status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'full_name', 'company_name', 'email', 'tier_interest', 'requirements', 'created_at', 'updated_at']

    def get_tier_interest_label(self, obj):
        return tier_label_for_slug(obj.tier_interest)

    def validate_status(self, value):
        if value not in SponsorInquiryStatus.values:
            raise serializers.ValidationError('Invalid status.')
        return value


class SpeakerApplicationCreateSerializer(HoneypotSerializerMixin, serializers.ModelSerializer):
    profile_photo = serializers.FileField(write_only=True)
    cv = serializers.FileField(write_only=True)

    class Meta:
        model = SpeakerApplication
        fields = [
            'full_name', 'email', 'occupation', 'role', 'professional_title', 'organization', 'bio',
            'profile_photo', 'cv',
            'linkedin_url', 'twitter_handle', 'instagram_handle',
            'session_title', 'track', 'session_format', 'target_audience',
            'abstract', 'key_takeaways', 'tech_requirements', 'co_speakers',
        ]

    def validate_profile_photo(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('Profile photo must be 5MB or smaller.')
        content_type = getattr(value, 'content_type', '') or ''
        name = (getattr(value, 'name', '') or '').lower()
        if content_type and not content_type.startswith('image/'):
            raise serializers.ValidationError('Profile photo must be an image file.')
        if not content_type and not name.endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif')):
            raise serializers.ValidationError('Profile photo must be an image file.')
        return value

    def validate_cv(self, value):
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError('CV file must be 10MB or smaller.')
        content_type = getattr(value, 'content_type', '') or ''
        name = (getattr(value, 'name', '') or '').lower()
        allowed_exts = ('.pdf', '.doc', '.docx', '.odt')
        if content_type and content_type not in (
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.oasis.opendocument.text',
        ):
            # Fallback to extension check if mime type is generic
            if not name.endswith(allowed_exts):
                raise serializers.ValidationError('CV must be a PDF or Word document.')
        elif not name.endswith(allowed_exts):
            raise serializers.ValidationError('CV must be a PDF or Word document.')
        return value

    def validate_full_name(self, value):
        return validate_person_name(value, 'Full name')

    def validate_email(self, value):
        value = validate_email_field(value)
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        if user and user.is_authenticated:
            if (
                self.instance is None
                and SpeakerApplication.objects.filter(user=user).exists()
            ):
                raise serializers.ValidationError('You have already submitted a speaker application.')
            return value.lower()
        if self.instance is None and SpeakerApplication.objects.filter(
            email__iexact=value,
            user__isnull=True,
        ).exists():
            raise serializers.ValidationError('An application with this email already exists.')
        return value

    def validate_professional_title(self, value):
        value = (value or '').strip()
        if len(value) < 2:
            raise serializers.ValidationError('Professional title is required.')
        return value

    def validate_organization(self, value):
        value = (value or '').strip()
        if len(value) < 2:
            raise serializers.ValidationError('Organization is required.')
        return value

    def validate_bio(self, value):
        value = (value or '').strip()
        if len(value) < 40:
            raise serializers.ValidationError('Bio must be at least 40 characters.')
        return value

    def validate_session_title(self, value):
        value = (value or '').strip()
        if len(value) < 5:
            raise serializers.ValidationError('Session title must be at least 5 characters.')
        return value

    def validate_abstract(self, value):
        value = (value or '').strip()
        if len(value) < 80:
            raise serializers.ValidationError('Abstract must be at least 80 characters.')
        return value

    def validate_key_takeaways(self, value):
        value = (value or '').strip()
        if len(value) < 20:
            raise serializers.ValidationError('Key takeaways are required.')
        return value

    def validate_track(self, value):
        if value not in SpeakerTrack.values:
            raise serializers.ValidationError('Invalid track selection.')
        return value

    def validate_session_format(self, value):
        if value not in SpeakerSessionFormat.values:
            raise serializers.ValidationError('Invalid session format.')
        return value

    def validate_linkedin_url(self, value):
        return validate_optional_url(value)

    def validate_twitter_handle(self, value):
        return (value or '').strip()[:120]

    def validate_instagram_handle(self, value):
        return (value or '').strip()[:120]

    def create(self, validated_data):
        photo = validated_data.pop('profile_photo')
        cv = validated_data.pop('cv')
        photo_asset = _create_speaker_profile_asset(photo)
        cv_asset = _create_speaker_cv_asset(cv)
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        extra = {}
        if user and user.is_authenticated:
            from apps.accounts.models import ParticipantInvite, ParticipantInviteType

            validated_data.pop('email', None)
            extra['user'] = user
            extra['email'] = user.email
            invited = ParticipantInvite.objects.filter(
                user=user,
                invite_type=ParticipantInviteType.SPEAKER,
                accepted_at__isnull=False,
            ).exists()
            extra['source'] = (
                SpeakerApplicationSource.INVITED if invited else SpeakerApplicationSource.PUBLIC
            )
            if not validated_data.get('full_name', '').strip():
                validated_data['full_name'] = user.full_name
        return SpeakerApplication.objects.create(
            profile_image_asset=photo_asset,
            cv_asset=cv_asset,
            status=SpeakerApplicationStatus.SUBMITTED,
            **extra,
            **validated_data,
        )


class SpeakerApplicationSerializer(serializers.ModelSerializer):
    track_label = serializers.CharField(source='get_track_display', read_only=True)
    session_format_label = serializers.CharField(source='get_session_format_display', read_only=True)

    class Meta:
        model = SpeakerApplication
        fields = [
            'id', 'full_name', 'email', 'occupation', 'role', 'professional_title', 'organization',
            'session_title', 'track', 'track_label', 'session_format',
            'session_format_label', 'status', 'created_at',
        ]
        read_only_fields = fields


class SpeakerApplicationAdminSerializer(serializers.ModelSerializer):
    track_label = serializers.CharField(source='get_track_display', read_only=True)
    session_format_label = serializers.CharField(source='get_session_format_display', read_only=True)
    profile_image_url = serializers.SerializerMethodField()
    cv_url = serializers.SerializerMethodField()

    class Meta:
        model = SpeakerApplication
        fields = [
            'id', 'full_name', 'email', 'occupation', 'role', 'professional_title', 'organization', 'bio',
            'profile_image_url', 'cv_url',
            'linkedin_url', 'twitter_handle', 'instagram_handle',
            'session_title', 'track', 'track_label', 'session_format', 'session_format_label',
            'target_audience', 'abstract', 'key_takeaways', 'tech_requirements', 'co_speakers',
            'status', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'full_name', 'email', 'occupation', 'role', 'professional_title', 'organization', 'bio',
            'profile_image_url', 'cv_url',
            'linkedin_url', 'twitter_handle', 'instagram_handle',
            'session_title', 'track', 'session_format', 'target_audience',
            'abstract', 'key_takeaways', 'tech_requirements', 'co_speakers',
            'created_at', 'updated_at',
        ]

    def get_profile_image_url(self, obj):
        if not obj.profile_image_asset_id or not obj.profile_image_asset:
            return ''
        return public_media_url(obj.profile_image_asset.file, self.context.get('request'))

    def get_cv_url(self, obj):
        if not obj.cv_asset_id or not obj.cv_asset:
            return ''
        return public_media_url(obj.cv_asset.file, self.context.get('request'))

    def validate_status(self, value):
        if value not in SpeakerApplicationStatus.values:
            raise serializers.ValidationError('Invalid status.')
        return value


class TicketWaitlistCreateSerializer(HoneypotSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = TicketWaitlist
        fields = ['full_name', 'email', 'tier_interest']

    def validate_full_name(self, value):
        return validate_person_name(value, 'Full name')

    def validate_email(self, value):
        value = validate_email_field(value)
        if TicketWaitlist.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('This email is already on the waitlist.')
        return value

    def validate_tier_interest(self, value):
        if value and value not in TicketWaitlistTier.values:
            raise serializers.ValidationError('Invalid ticket tier.')
        return value or TicketWaitlistTier.GENERAL


class TicketWaitlistSerializer(serializers.ModelSerializer):
    tier_interest_label = serializers.CharField(source='get_tier_interest_display', read_only=True)

    class Meta:
        model = TicketWaitlist
        fields = ['id', 'full_name', 'email', 'tier_interest', 'tier_interest_label', 'status', 'created_at']
        read_only_fields = fields


class TicketWaitlistAdminSerializer(serializers.ModelSerializer):
    tier_interest_label = serializers.CharField(source='get_tier_interest_display', read_only=True)

    class Meta:
        model = TicketWaitlist
        fields = [
            'id', 'full_name', 'email', 'tier_interest', 'tier_interest_label',
            'status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'full_name', 'email', 'tier_interest', 'created_at', 'updated_at']

    def validate_status(self, value):
        if value not in TicketWaitlistStatus.values:
            raise serializers.ValidationError('Invalid status.')
        return value


class OutreachOptionsSerializer(serializers.Serializer):
    sponsor_tiers = serializers.ListField()
    speaker_tracks = serializers.ListField()
    speaker_formats = serializers.ListField()
    ticket_waitlist_tiers = serializers.ListField()
