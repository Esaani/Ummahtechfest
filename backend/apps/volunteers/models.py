from django.conf import settings
from django.db import models

from common.models import BaseModel


class VolunteerRoleCategory(models.TextChoices):
    EVENT_SUPPORT = 'event_support', 'Event & Community Support'
    CREATIVE_MEDIA = 'creative_media', 'Creative & Multimedia'


class VolunteerApplicationStatus(models.TextChoices):
    SUBMITTED = 'submitted', 'Submitted'
    UNDER_REVIEW = 'under_review', 'Under Review'
    INTERVIEW = 'interview', 'Interview'
    ACCEPTED = 'accepted', 'Accepted'
    REJECTED = 'rejected', 'Rejected'
    WITHDRAWN = 'withdrawn', 'Withdrawn'


class VolunteerRole(BaseModel):
    slug = models.SlugField(max_length=100)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=32, choices=VolunteerRoleCategory.choices)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'volunteer_roles'
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(
                fields=['slug'],
                condition=models.Q(deleted_at__isnull=True),
                name='unique_volunteer_role_slug_alive',
            ),
        ]

    def __str__(self):
        return self.name


class VolunteerApplication(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='volunteer_applications',
        db_column='user_id',
    )
    status = models.CharField(
        max_length=32,
        choices=VolunteerApplicationStatus.choices,
        default=VolunteerApplicationStatus.SUBMITTED,
    )
    phone = models.CharField(max_length=32, blank=True)
    city = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=120, blank=True)
    skills_summary = models.TextField()
    motivation = models.TextField()
    availability = models.JSONField(default=dict)
    experience_years = models.PositiveSmallIntegerField(default=0)
    portfolio_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    code_of_conduct_accepted = models.BooleanField(default=False)
    preferred_roles = models.ManyToManyField(
        VolunteerRole,
        related_name='applications',
        through='VolunteerApplicationPreferredRole',
        blank=True,
    )
    assigned_role = models.ForeignKey(
        VolunteerRole,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_applications',
        db_column='assigned_role_id',
    )
    admin_notes = models.TextField(blank=True)

    class Meta:
        db_table = 'volunteer_applications'
        constraints = [
            models.UniqueConstraint(
                fields=['user'],
                condition=models.Q(deleted_at__isnull=True),
                name='unique_volunteer_application_per_user',
            ),
        ]

    def __str__(self):
        return f'{self.user.email} - {self.status}'

    @property
    def can_withdraw(self):
        from apps.volunteers.constants import WITHDRAWABLE_STATUSES

        return self.status in WITHDRAWABLE_STATUSES


class VolunteerApplicationPreferredRole(models.Model):
    application = models.ForeignKey(
        VolunteerApplication,
        on_delete=models.CASCADE,
        db_column='application_id',
    )
    role = models.ForeignKey(
        VolunteerRole,
        on_delete=models.CASCADE,
        db_column='role_id',
    )

    class Meta:
        db_table = 'volunteer_application_preferred_roles'
        constraints = [
            models.UniqueConstraint(fields=['application', 'role'], name='unique_application_role'),
        ]


class VolunteerApplicationStatusHistory(BaseModel):
    application = models.ForeignKey(
        VolunteerApplication,
        on_delete=models.CASCADE,
        related_name='status_history',
        db_column='application_id',
    )
    from_status = models.CharField(max_length=32, blank=True)
    to_status = models.CharField(max_length=32)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='changed_by_id',
    )
    note = models.TextField(blank=True)

    class Meta:
        db_table = 'volunteer_application_status_history'
        ordering = ['-created_at']
