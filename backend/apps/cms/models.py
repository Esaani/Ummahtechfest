from django.conf import settings
from django.db import models

from common.models import BaseModel


class CmsPage(models.TextChoices):
    HOME = 'home', 'Home'
    GHANA_2026 = 'ghana_2026', 'Ghana 2026'
    GLOBAL = 'global', 'Global (footer, announcements)'


def cms_media_upload_path(instance, filename):
    folder = instance.folder.strip('/') if instance.folder else 'general'
    return f'cms/{folder}/{filename}'


class SiteSection(BaseModel):
    """Editable page section identified by stable slug."""

    slug = models.SlugField(max_length=120)
    page = models.CharField(max_length=32, choices=CmsPage.choices, db_index=True)
    label = models.CharField(max_length=200, help_text='Admin display name')
    content = models.JSONField(default=dict, blank=True)
    is_published = models.BooleanField(default=True, db_index=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'cms_site_sections'
        ordering = ['page', 'sort_order', 'slug']
        indexes = [
            models.Index(fields=['page', 'is_published', 'sort_order']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['slug'],
                condition=models.Q(deleted_at__isnull=True),
                name='unique_cms_site_section_slug_alive',
            ),
        ]

    def __str__(self):
        return f'{self.page}:{self.slug}'


class MediaAsset(BaseModel):
    """Uploaded media (images, video) stored locally or on Cloudflare R2."""

    title = models.CharField(max_length=200, blank=True)
    alt_text = models.CharField(max_length=255, blank=True)
    folder = models.CharField(max_length=64, default='general', db_index=True)
    file = models.FileField(upload_to=cms_media_upload_path)
    mime_type = models.CharField(max_length=120, blank=True)
    file_size = models.PositiveIntegerField(default=0)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cms_uploads',
    )
    is_private = models.BooleanField(
        default=False,
        help_text='When true, the file is only accessible via the secure proxy view.',
    )

    class Meta:
        db_table = 'cms_media_assets'
        ordering = ['-created_at']

    def __str__(self):
        return self.title or self.file.name


class SponsorTier(models.TextChoices):
    GLOBAL_PARTNER = 'global_partner', 'Global partner'
    SPONSOR = 'sponsor', 'Sponsor'


class FeaturedSpeaker(BaseModel):
    """Speaker card shown on the public homepage (not the apply-to-speak pipeline)."""

    name = models.CharField(max_length=200)
    role = models.CharField(max_length=255, help_text='Title / organization line under the name')
    bio = models.TextField(blank=True)
    image_url = models.URLField(blank=True, max_length=500)
    image_asset = models.ForeignKey(
        MediaAsset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='featured_speakers',
    )
    speaker_application = models.OneToOneField(
        'outreach.SpeakerApplication',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='featured_speaker',
    )
    sort_order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = 'cms_featured_speakers'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class ScheduleTrack(models.TextChoices):
    MAIN_STAGE = 'main_stage', 'Main Stage'
    AI_ETHICS = 'ai_ethics', 'AI & Ethics'
    FINTECH = 'fintech', 'Fintech'
    WORKSHOP = 'workshop', 'Hands-on Workshop'
    COMMUNITY = 'community', 'Community'
    OTHER = 'other', 'Other'


class ScheduleItemType(models.TextChoices):
    SESSION = 'session', 'Session'
    BREAK = 'break', 'Break / intermission'


class ScheduleSession(BaseModel):
    """Agenda item for homepage preview and /schedule page."""

    slug = models.SlugField(max_length=120)
    item_type = models.CharField(
        max_length=16,
        choices=ScheduleItemType.choices,
        default=ScheduleItemType.SESSION,
    )
    event_day = models.PositiveSmallIntegerField(default=1, db_index=True)
    day_label = models.CharField(max_length=20, help_text='e.g. 01 or Day 1')
    day_date_label = models.CharField(max_length=64, blank=True, help_text='e.g. Jan 15, 2026')
    starts_at_time = models.CharField(max_length=8, default='09:00', help_text='24h HH:MM for sorting')
    time_label = models.CharField(max_length=80, help_text='e.g. 09:00 AM or LIVE NOW')
    title = models.CharField(max_length=300)
    subtitle = models.CharField(max_length=500, blank=True)
    track = models.CharField(
        max_length=32,
        choices=ScheduleTrack.choices,
        blank=True,
        db_index=True,
    )
    location = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    outcomes = models.JSONField(default=list, blank=True)
    speaker_name = models.CharField(max_length=200, blank=True)
    speaker_role = models.CharField(max_length=255, blank=True)
    speaker_image_url = models.URLField(blank=True, max_length=500)
    speaker_quote = models.TextField(blank=True)
    is_live_highlight = models.BooleanField(default=False)
    show_on_home = models.BooleanField(default=False, db_index=True)
    is_published = models.BooleanField(default=True, db_index=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'cms_schedule_sessions'
        ordering = ['event_day', 'sort_order', 'starts_at_time', 'title']
        constraints = [
            models.UniqueConstraint(
                fields=['slug'],
                condition=models.Q(deleted_at__isnull=True),
                name='unique_cms_schedule_session_slug_alive',
            ),
        ]

    def __str__(self):
        return f'Day {self.event_day}: {self.title}'


class SponsorshipBenefitRow(BaseModel):
    """Row labels for the public sponsorship comparison table."""

    key = models.SlugField(max_length=80)
    label = models.CharField(max_length=200)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'cms_sponsorship_benefit_rows'
        ordering = ['sort_order', 'label']
        constraints = [
            models.UniqueConstraint(
                fields=['key'],
                condition=models.Q(deleted_at__isnull=True),
                name='unique_sponsorship_benefit_key_alive',
            ),
        ]

    def __str__(self):
        return self.label


class SponsorshipPackage(BaseModel):
    """Sponsorship tier shown on /sponsor (form + comparison table)."""

    slug = models.SlugField(max_length=80)
    name = models.CharField(max_length=200)
    tagline = models.CharField(max_length=255, blank=True, help_text='Short line on inquiry form cards')
    price_display = models.CharField(max_length=64, blank=True, help_text='e.g. ₵15,000')
    benefit_values = models.JSONField(
        default=dict,
        blank=True,
        help_text='Map of benefit row key → cell value for comparison table',
    )
    show_on_inquiry_form = models.BooleanField(default=True, db_index=True)
    show_in_comparison_table = models.BooleanField(default=True, db_index=True)
    highlight_column = models.BooleanField(
        default=False,
        help_text='Highlight this column in the comparison table (e.g. recommended tier)',
    )
    sort_order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = 'cms_sponsorship_packages'
        ordering = ['sort_order', 'name']
        constraints = [
            models.UniqueConstraint(
                fields=['slug'],
                condition=models.Q(deleted_at__isnull=True),
                name='unique_sponsorship_package_slug_alive',
            ),
        ]

    def __str__(self):
        return self.name


class FeaturedSponsor(BaseModel):
    """Sponsor or global partner logo/name on the public site."""

    name = models.CharField(max_length=200)
    tier = models.CharField(
        max_length=32,
        choices=SponsorTier.choices,
        default=SponsorTier.SPONSOR,
        db_index=True,
    )
    website = models.URLField(blank=True)
    logo_url = models.URLField(blank=True, max_length=500)
    logo_asset = models.ForeignKey(
        MediaAsset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='featured_sponsors',
    )
    sort_order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = 'cms_featured_sponsors'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class AttendeeVoice(BaseModel):
    """Testimonials and feedback from past attendees."""

    name = models.CharField(max_length=200)
    role = models.CharField(max_length=255, blank=True, help_text='Title / Organization')
    quote = models.TextField()
    image_url = models.URLField(blank=True, max_length=500)
    image_asset = models.ForeignKey(
        MediaAsset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='attendee_voices',
    )
    is_published = models.BooleanField(default=True, db_index=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'cms_attendee_voices'
        ordering = ['sort_order', '-created_at']

    def __str__(self):
        return f'{self.name} - {self.role}'
