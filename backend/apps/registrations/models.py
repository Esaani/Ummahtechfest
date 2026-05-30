from django.conf import settings
from django.db import models

from common.models import BaseModel


class PassFlow(models.TextChoices):
    OPEN = 'open', 'Open registration'
    APPROVAL = 'approval', 'Approval required'


class PassRegistrationStatus(models.TextChoices):
    SUBMITTED = 'submitted', 'Submitted'
    UNDER_REVIEW = 'under_review', 'Under review'
    APPROVED = 'approved', 'Approved'
    REJECTED = 'rejected', 'Rejected'
    PENDING_PAYMENT = 'pending_payment', 'Pending payment'
    PAID = 'paid', 'Paid'
    WITHDRAWN = 'withdrawn', 'Withdrawn'


class PassType(BaseModel):
    slug = models.SlugField(max_length=50)
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    flow = models.CharField(max_length=20, choices=PassFlow.choices)
    is_active = models.BooleanField(default=True)
    is_open_for_registration = models.BooleanField(default=True)
    # Public signup / marketing display (managed in CMS admin)
    sort_order = models.PositiveIntegerField(default=0)
    icon = models.CharField(max_length=64, default='badge')
    tag = models.CharField(max_length=40, blank=True)
    features = models.JSONField(default=list, blank=True)
    cta_label = models.CharField(max_length=120, blank=True)
    display_color = models.CharField(max_length=32, default='primary-fixed')
    is_outline_style = models.BooleanField(default=False)
    show_on_signup = models.BooleanField(default=True)
    is_wired = models.BooleanField(
        default=True,
        help_text='When false, signup shows “coming soon” for this pass.',
    )

    class Meta:
        db_table = 'pass_types'
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(
                fields=['slug'],
                condition=models.Q(deleted_at__isnull=True),
                name='unique_pass_type_slug_alive',
            ),
        ]

    def __str__(self):
        return self.name


class PassRegistration(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='pass_registrations',
        db_column='user_id',
    )
    pass_type = models.ForeignKey(
        PassType,
        on_delete=models.PROTECT,
        related_name='registrations',
        db_column='pass_type_id',
    )
    status = models.CharField(
        max_length=32,
        choices=PassRegistrationStatus.choices,
        default=PassRegistrationStatus.SUBMITTED,
    )
    job_title = models.CharField(max_length=200, blank=True)
    experience_years = models.PositiveSmallIntegerField(default=0)
    organization = models.CharField(max_length=255, blank=True)
    organization_website = models.URLField(blank=True)
    contribution_statement = models.TextField(blank=True)

    class Meta:
        db_table = 'pass_registrations'
        constraints = [
            models.UniqueConstraint(
                fields=['user'],
                condition=models.Q(deleted_at__isnull=True),
                name='unique_pass_registration_per_user',
            ),
        ]

    def __str__(self):
        return f'{self.user.email} - {self.pass_type.slug}'
