import mimetypes

from rest_framework import serializers

from apps.cms.models import (
    AttendeeVoice,
    CmsPage,
    FeaturedSpeaker,
    FeaturedSponsor,
    MediaAsset,
    ScheduleItemType,
    ScheduleSession,
    ScheduleTrack,
    SiteSection,
    SponsorTier,
    SponsorshipBenefitRow,
    SponsorshipPackage,
)
from apps.cms.section_media import publish_section_content
from common.media_urls import public_media_url
from common.slug_utils import unique_slug_for_model


def _asset_url(asset, request):
    if not asset or not asset.file:
        return ''
    return public_media_url(asset.file, request)


def _speaker_image(speaker, request):
    if speaker.image_asset_id:
        url = _asset_url(speaker.image_asset, request)
        if url:
            return url
    return speaker.image_url or ''


def _sponsor_logo(sponsor, request):
    if sponsor.logo_asset_id:
        url = _asset_url(sponsor.logo_asset, request)
        if url:
            return url
    return sponsor.logo_url or ''


class SiteSectionPublicSerializer(serializers.ModelSerializer):
    content = serializers.SerializerMethodField()

    class Meta:
        model = SiteSection
        fields = ['slug', 'page', 'label', 'content', 'sort_order']
        read_only_fields = fields

    def get_content(self, obj):
        return publish_section_content(obj.content, self.context.get('request'))


class SiteSectionAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSection
        fields = [
            'id', 'slug', 'page', 'label', 'content', 'is_published',
            'sort_order', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['content'] = publish_section_content(instance.content, self.context.get('request'))
        return data

    def validate_page(self, value):
        if value not in CmsPage.values:
            raise serializers.ValidationError('Invalid page.')
        return value

    def validate_slug(self, value):
        return value.lower().strip()


class MediaAssetSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = [
            'id', 'title', 'alt_text', 'folder', 'url', 'mime_type',
            'file_size', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'mime_type', 'file_size', 'url', 'created_at', 'updated_at']

    def get_url(self, obj):
        return public_media_url(obj.file, self.context.get('request'))


class MediaAssetUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaAsset
        fields = ['file', 'title', 'alt_text', 'folder']

    def validate_file(self, value):
        mime = getattr(value, 'content_type', '') or ''
        is_video = mime.startswith('video/') or (value.name or '').lower().endswith(
            ('.mp4', '.webm', '.mov')
        )
        max_bytes = 100 * 1024 * 1024 if is_video else 50 * 1024 * 1024
        if value.size > max_bytes:
            limit = '100MB' if is_video else '50MB'
            raise serializers.ValidationError(f'File must be {limit} or smaller.')
        return value

    def create(self, validated_data):
        uploaded = validated_data['file']
        user = self.context['request'].user
        mime, _ = mimetypes.guess_type(uploaded.name)
        return MediaAsset.objects.create(
            uploaded_by=user,
            mime_type=mime or getattr(uploaded, 'content_type', '') or '',
            file_size=uploaded.size,
            title=validated_data.get('title') or uploaded.name,
            alt_text=validated_data.get('alt_text', ''),
            folder=validated_data.get('folder') or 'general',
            file=uploaded,
        )


class FeaturedSpeakerPublicSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = FeaturedSpeaker
        fields = ['id', 'name', 'role', 'bio', 'image', 'sort_order']

    def get_image(self, obj):
        return _speaker_image(obj, self.context.get('request'))


class FeaturedSpeakerAdminSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    image_asset = serializers.PrimaryKeyRelatedField(
        queryset=MediaAsset.objects.all(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = FeaturedSpeaker
        fields = [
            'id', 'name', 'role', 'bio', 'image_url', 'image_asset', 'image',
            'sort_order', 'is_published', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'image', 'created_at', 'updated_at']

    def get_image(self, obj):
        return _speaker_image(obj, self.context.get('request'))


class FeaturedSponsorPublicSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()

    class Meta:
        model = FeaturedSponsor
        fields = ['id', 'name', 'tier', 'website', 'logo', 'sort_order']

    def get_logo(self, obj):
        return _sponsor_logo(obj, self.context.get('request'))


class FeaturedSponsorAdminSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    logo_asset = serializers.PrimaryKeyRelatedField(
        queryset=MediaAsset.objects.all(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = FeaturedSponsor
        fields = [
            'id', 'name', 'tier', 'website', 'logo_url', 'logo_asset', 'logo',
            'sort_order', 'is_published', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'logo', 'created_at', 'updated_at']

    def get_logo(self, obj):
        return _sponsor_logo(obj, self.context.get('request'))

    def validate_tier(self, value):
        if value not in SponsorTier.values:
            raise serializers.ValidationError('Invalid tier.')
        return value


class SponsorshipBenefitRowAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = SponsorshipBenefitRow
        fields = ['id', 'key', 'label', 'sort_order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_key(self, value):
        value = (value or '').strip().lower().replace(' ', '-')
        if not value:
            raise serializers.ValidationError('Key is required.')
        return value


class SponsorshipPackageAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = SponsorshipPackage
        fields = [
            'id', 'slug', 'name', 'tagline', 'price_display', 'benefit_values',
            'show_on_inquiry_form', 'show_in_comparison_table', 'highlight_column',
            'sort_order', 'is_published', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_slug(self, value):
        value = (value or '').strip().lower().replace(' ', '-')
        if not value:
            raise serializers.ValidationError('Slug is required.')
        return value

    def validate_benefit_values(self, value):
        if value is None:
            return {}
        if not isinstance(value, dict):
            raise serializers.ValidationError('Benefit values must be a JSON object (row key → cell text).')
        return {str(k): str(v) for k, v in value.items()}


class ScheduleSessionPublicSerializer(serializers.ModelSerializer):
    track_label = serializers.CharField(source='get_track_display', read_only=True)
    time = serializers.CharField(source='time_label', read_only=True)
    desc = serializers.CharField(source='subtitle', read_only=True)
    day = serializers.CharField(source='day_label', read_only=True)
    live = serializers.BooleanField(source='is_live_highlight', read_only=True)
    speaker = serializers.SerializerMethodField()

    class Meta:
        model = ScheduleSession
        fields = [
            'id', 'slug', 'item_type', 'event_day', 'day', 'day_label', 'day_date_label',
            'starts_at_time', 'time', 'time_label', 'title', 'subtitle', 'desc',
            'track', 'track_label', 'location', 'description', 'outcomes',
            'is_live_highlight', 'live', 'show_on_home', 'sort_order', 'speaker',
        ]

    def get_speaker(self, obj):
        if not obj.speaker_name:
            return None
        return {
            'name': obj.speaker_name,
            'role': obj.speaker_role,
            'image': obj.speaker_image_url or '',
            'quote': obj.speaker_quote or '',
        }


class ScheduleSessionAdminSerializer(serializers.ModelSerializer):
    track_label = serializers.CharField(source='get_track_display', read_only=True)

    class Meta:
        model = ScheduleSession
        fields = [
            'id', 'slug', 'item_type', 'event_day', 'day_label', 'day_date_label',
            'starts_at_time', 'time_label', 'title', 'subtitle', 'track', 'track_label',
            'location', 'description', 'outcomes', 'speaker_name', 'speaker_role',
            'speaker_image_url', 'speaker_quote', 'is_live_highlight', 'show_on_home',
            'is_published', 'sort_order', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'track_label', 'created_at', 'updated_at']

    def validate_item_type(self, value):
        if value not in ScheduleItemType.values:
            raise serializers.ValidationError('Invalid item type.')
        return value

    def validate_track(self, value):
        if value and value not in ScheduleTrack.values:
            raise serializers.ValidationError('Invalid track.')
        return value

    def validate_event_day(self, value):
        if value < 1 or value > 14:
            raise serializers.ValidationError('Event day must be between 1 and 14.')
        return value

    def validate_starts_at_time(self, value):
        import re

        if not re.match(r'^\d{2}:\d{2}$', value or ''):
            raise serializers.ValidationError('Use 24-hour format HH:MM (e.g. 09:00).')
        return value

    def validate_outcomes(self, value):
        if value is None:
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError('Outcomes must be a list.')
        return [str(item).strip() for item in value if str(item).strip()]

    def create(self, validated_data):
        validated_data['slug'] = unique_slug_for_model(ScheduleSession, validated_data['title'])
        return super().create(validated_data)


def _voice_image(voice, request):
    if voice.image_asset_id:
        url = _asset_url(voice.image_asset, request)
        if url:
            return url
    return voice.image_url or ''


class AttendeeVoicePublicSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = AttendeeVoice
        fields = ['id', 'name', 'role', 'quote', 'image', 'sort_order']

    def get_image(self, obj):
        return _voice_image(obj, self.context.get('request'))


class AttendeeVoiceAdminSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    image_asset = serializers.PrimaryKeyRelatedField(
        queryset=MediaAsset.objects.all(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = AttendeeVoice
        fields = [
            'id', 'name', 'role', 'quote', 'image_url', 'image_asset', 'image',
            'is_published', 'sort_order', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'image', 'created_at', 'updated_at']

    def get_image(self, obj):
        return _voice_image(obj, self.context.get('request'))
