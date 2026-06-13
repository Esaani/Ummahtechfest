from django.conf import settings
from django.db import models

from common.models import BaseModel


class SponsorTierInterest(models.TextChoices):
    DIAMOND = 'diamond', 'Diamond Partner'
    GOLD = 'gold', 'Gold Partner'
    SILVER = 'silver', 'Silver Partner'
    CUSTOM = 'custom', 'Custom Sponsorship'


class SponsorInquiryStatus(models.TextChoices):
    NEW = 'new', 'New'
    CONTACTED = 'contacted', 'Contacted'
    CLOSED = 'closed', 'Closed'


class SponsorInquiry(BaseModel):
    full_name = models.CharField(max_length=200)
    company_name = models.CharField(max_length=255)
    email = models.EmailField(db_index=True)
    tier_interest = models.CharField(max_length=32, choices=SponsorTierInterest.choices)
    requirements = models.TextField(blank=True)
    status = models.CharField(
        max_length=32,
        choices=SponsorInquiryStatus.choices,
        default=SponsorInquiryStatus.NEW,
        db_index=True,
    )

    class Meta:
        db_table = 'sponsor_inquiries'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.company_name} ({self.email})'


class SpeakerTrack(models.TextChoices):
    ETHICAL_AI = 'ethical_ai', 'Ethical AI'
    UMMAH_FINTECH = 'ummah_fintech', 'Ummah Fintech'
    WEB3_TRUST = 'web3_trust', 'Web3 & Trust'
    SOCIAL_GOOD = 'social_good', 'Tech for Social Good'
    GLOBAL_CONNECTIVITY = 'global_connectivity', 'Global Connectivity'


class SpeakerSessionFormat(models.TextChoices):
    KEYNOTE = 'keynote', 'Keynote'
    WORKSHOP = 'workshop', 'Workshop'
    PANEL = 'panel', 'Panel'


class SpeakerApplicationStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    SUBMITTED = 'submitted', 'Submitted'
    UNDER_REVIEW = 'under_review', 'Under Review'
    ACCEPTED = 'accepted', 'Accepted'
    REJECTED = 'rejected', 'Rejected'


class SpeakerApplicationSource(models.TextChoices):
    PUBLIC = 'public', 'Public application'
    INVITED = 'invited', 'Admin invite'


class SpeakerApplication(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='speaker_applications',
        db_column='user_id',
    )
    source = models.CharField(
        max_length=16,
        choices=SpeakerApplicationSource.choices,
        default=SpeakerApplicationSource.PUBLIC,
        db_index=True,
    )
    full_name = models.CharField(max_length=200)
    email = models.EmailField(db_index=True)
    professional_title = models.CharField(max_length=200)
    organization = models.CharField(max_length=255)
    occupation = models.CharField(max_length=200, blank=True)
    role = models.CharField(max_length=200, blank=True)
    bio = models.TextField()
    cv_asset = models.ForeignKey(
        'cms.MediaAsset',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='speaker_cvs',
    )
    profile_image_asset = models.ForeignKey(
        'cms.MediaAsset',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='speaker_applications',
    )
    linkedin_url = models.URLField(blank=True)
    twitter_handle = models.CharField(max_length=120, blank=True)
    instagram_handle = models.CharField(max_length=120, blank=True)
    session_title = models.CharField(max_length=300)
    track = models.CharField(max_length=32, choices=SpeakerTrack.choices)
    session_format = models.CharField(max_length=32, choices=SpeakerSessionFormat.choices)
    target_audience = models.CharField(max_length=255, blank=True)
    abstract = models.TextField()
    key_takeaways = models.TextField()
    tech_requirements = models.TextField(blank=True)
    co_speakers = models.TextField(blank=True)
    status = models.CharField(
        max_length=32,
        choices=SpeakerApplicationStatus.choices,
        default=SpeakerApplicationStatus.SUBMITTED,
        db_index=True,
    )

    class Meta:
        db_table = 'speaker_applications'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['email'],
                condition=models.Q(deleted_at__isnull=True, user__isnull=True),
                name='unique_speaker_application_email_anon',
            ),
            models.UniqueConstraint(
                fields=['user'],
                condition=models.Q(deleted_at__isnull=True, user__isnull=False),
                name='unique_speaker_application_per_user',
            ),
        ]

    def __str__(self):
        return f'{self.full_name} — {self.session_title}'


class TicketWaitlistTier(models.TextChoices):
    GENERAL = 'general', 'General interest'
    EARLY_BIRD = 'early_bird', 'Early Bird'
    STANDARD = 'standard', 'Standard'
    VIP = 'vip', 'VIP'


class TicketWaitlistStatus(models.TextChoices):
    NEW = 'new', 'New'
    CONTACTED = 'contacted', 'Contacted'
    CONVERTED = 'converted', 'Converted'
    CLOSED = 'closed', 'Closed'


class TicketWaitlist(BaseModel):
    full_name = models.CharField(max_length=200)
    email = models.EmailField(db_index=True)
    tier_interest = models.CharField(
        max_length=32,
        choices=TicketWaitlistTier.choices,
        default=TicketWaitlistTier.GENERAL,
    )
    status = models.CharField(
        max_length=32,
        choices=TicketWaitlistStatus.choices,
        default=TicketWaitlistStatus.NEW,
        db_index=True,
    )

    class Meta:
        db_table = 'ticket_waitlist'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['email'],
                condition=models.Q(deleted_at__isnull=True),
                name='unique_ticket_waitlist_email_alive',
            ),
        ]

    def __str__(self):
        return f'{self.full_name} ({self.email})'


class NewsletterSubscriberStatus(models.TextChoices):
    SUBSCRIBED = 'subscribed', 'Subscribed'
    UNSUBSCRIBED = 'unsubscribed', 'Unsubscribed'


class NewsletterSubscriber(BaseModel):
    email = models.EmailField(db_index=True)
    status = models.CharField(
        max_length=32,
        choices=NewsletterSubscriberStatus.choices,
        default=NewsletterSubscriberStatus.SUBSCRIBED,
        db_index=True,
    )

    class Meta:
        db_table = 'newsletter_subscribers'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['email'],
                condition=models.Q(deleted_at__isnull=True),
                name='unique_newsletter_email_alive',
            ),
        ]

    def __str__(self):
        return self.email
