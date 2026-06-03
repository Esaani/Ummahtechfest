from rest_framework import serializers

from apps.registrations.models import PassRegistration, PassRegistrationStatus, PassType, PassFlow
from common.security import HoneypotSerializerMixin
from common.slug_utils import unique_slug_for_model


class PassTypeSerializer(serializers.ModelSerializer):
    wired = serializers.BooleanField(source='is_wired', read_only=True)
    outline = serializers.BooleanField(source='is_outline_style', read_only=True)
    color = serializers.CharField(source='display_color', read_only=True)
    cta = serializers.CharField(source='cta_label', read_only=True)

    class Meta:
        model = PassType
        fields = [
            'id', 'slug', 'name', 'description', 'flow', 'is_open_for_registration',
            'sort_order', 'icon', 'tag', 'features', 'cta', 'color', 'outline', 'wired',
            'show_on_signup', 'is_active', 'price_ghs',
        ]


class PassTypeAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = PassType
        fields = [
            'id', 'slug', 'name', 'description', 'flow', 'is_active', 'is_open_for_registration',
            'sort_order', 'icon', 'tag', 'features', 'cta_label', 'display_color',
            'is_outline_style', 'show_on_signup', 'is_wired', 'price_ghs',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['slug'] = unique_slug_for_model(PassType, validated_data['name'])
        return super().create(validated_data)

    def validate_features(self, value):
        if value is None:
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError('Features must be a list of strings.')
        return [str(item) for item in value]


class OpenPassRegistrationSerializer(HoneypotSerializerMixin, serializers.Serializer):
    pass_type = serializers.SlugField()
    job_title = serializers.CharField(max_length=200)
    experience_years = serializers.IntegerField(min_value=0, max_value=60)
    organization = serializers.CharField(max_length=255)

    def validate_pass_type(self, value):
        try:
            pt = PassType.objects.get(slug=value, is_active=True, is_open_for_registration=True)
        except PassType.DoesNotExist:
            raise serializers.ValidationError('This pass is not available for registration.')
        if pt.flow != PassFlow.OPEN:
            raise serializers.ValidationError('This pass requires a special access application.')
        return pt

    def create(self, validated_data):
        user = self.context['request'].user
        if PassRegistration.objects.filter(user=user).exists():
            raise serializers.ValidationError(
                'You already have an event pass registration. Each person may register once.'
            )
        pass_type = validated_data['pass_type']
        return PassRegistration.objects.create(
            user=user,
            pass_type=pass_type,
            job_title=validated_data['job_title'],
            experience_years=validated_data['experience_years'],
            organization=validated_data['organization'],
            status=PassRegistrationStatus.PENDING_PAYMENT,
        )


class SpecialAccessRegistrationSerializer(HoneypotSerializerMixin, serializers.Serializer):
    pass_type = serializers.SlugField()
    organization_name = serializers.CharField(max_length=255)
    job_title = serializers.CharField(max_length=200)
    organization_website = serializers.URLField(required=False, allow_blank=True)
    contribution_statement = serializers.CharField()

    def validate_pass_type(self, value):
        try:
            pt = PassType.objects.get(slug=value, is_active=True, is_open_for_registration=True)
        except PassType.DoesNotExist:
            raise serializers.ValidationError('This pass is not available for registration.')
        if pt.flow != PassFlow.APPROVAL:
            raise serializers.ValidationError('This pass uses the standard registration flow.')
        return pt

    def create(self, validated_data):
        user = self.context['request'].user
        if PassRegistration.objects.filter(user=user).exists():
            raise serializers.ValidationError(
                'You already have an event pass registration. Each person may register once.'
            )
        pass_type = validated_data['pass_type']
        return PassRegistration.objects.create(
            user=user,
            pass_type=pass_type,
            organization=validated_data['organization_name'],
            job_title=validated_data['job_title'],
            organization_website=validated_data.get('organization_website', ''),
            contribution_statement=validated_data['contribution_statement'],
            status=PassRegistrationStatus.SUBMITTED,
        )


class PassRegistrationSerializer(serializers.ModelSerializer):
    pass_type = PassTypeSerializer(read_only=True)

    class Meta:
        model = PassRegistration
        fields = [
            'id', 'status', 'pass_type', 'job_title', 'experience_years', 'organization',
            'organization_website', 'contribution_statement', 'created_at', 'updated_at',
        ]
        read_only_fields = fields
