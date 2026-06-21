from django.conf import settings
from django.db import models

from common.models import BaseModel


class VolunteerRoleCategory(models.TextChoices):
    EVENT_SUPPORT = 'event_support', 'Event & Community Support'
    CREATIVE_MEDIA = 'creative_media', 'Creative & Multimedia'
    TECHNICAL_TRAINING = 'tech_training', 'Technical & Training'


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
    occupation = models.CharField(max_length=200, blank=True)
    cv_asset = models.ForeignKey(
        'cms.MediaAsset',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='volunteer_cvs',
    )
    profile_image_asset = models.ForeignKey(
        'cms.MediaAsset',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='volunteer_photos',
    )
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


class VolunteerTaskStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    IN_PROGRESS = 'in_progress', 'In Progress'
    DONE = 'done', 'Done'


class VolunteerTask(BaseModel):
    """Task assigned to an individual volunteer or all volunteers in a role."""

    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    due_label = models.CharField(max_length=100, blank=True, help_text='e.g. "Day 1, 08:00 AM"')
    status = models.CharField(
        max_length=16,
        choices=VolunteerTaskStatus.choices,
        default=VolunteerTaskStatus.PENDING,
        db_index=True,
    )
    # Exactly one of application or target_role must be set.
    # application=set → individual task; target_role=set, application=null → role-wide task.
    application = models.ForeignKey(
        VolunteerApplication,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='tasks',
        db_column='application_id',
    )
    target_role = models.ForeignKey(
        VolunteerRole,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks',
        db_column='target_role_id',
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='volunteer_tasks_assigned',
        db_column='assigned_by_id',
    )

    class Meta:
        db_table = 'volunteer_tasks'
        ordering = ['status', 'created_at']

    def __str__(self):
        return self.title


class VolunteerAnnouncement(BaseModel):
    """Broadcast message posted by admins to accepted volunteers."""

    title = models.CharField(max_length=300)
    body = models.TextField()
    target_role = models.ForeignKey(
        VolunteerRole,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='announcements',
        db_column='target_role_id',
        help_text='Null = visible to all accepted volunteers.',
    )
    posted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='volunteer_announcements',
        db_column='posted_by_id',
    )
    is_published = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = 'volunteer_announcements'
        ordering = ['-created_at']

    def __str__(self):
        return self.title
