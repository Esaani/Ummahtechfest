from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone

from apps.accounts.managers import UserManager
from common.models import BaseModel


class AdminRole(models.TextChoices):
    """Portal roles for non-superuser staff. Superusers have all permissions."""

    CONTENT_MANAGER = 'content_manager', 'Content manager'
    SUBMISSIONS_REVIEWER = 'submissions_reviewer', 'Submissions reviewer'
    USER_MANAGER = 'user_manager', 'User manager'
    OPERATIONS = 'operations', 'Operations (content + submissions)'


class User(BaseModel, AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    admin_role = models.CharField(
        max_length=32,
        choices=AdminRole.choices,
        null=True,
        blank=True,
        db_index=True,
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'users'

    def delete(self, using=None, keep_parents=False):
        if not self.is_deleted:
            local, domain = self.email.split('@', 1) if '@' in self.email else (self.email, '')
            if domain:
                self.email = f'{local}+deleted.{self.id}@{domain}'[:254]
        super().delete(using=using, keep_parents=keep_parents)

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip() or self.email


class EmailVerificationPurpose(models.TextChoices):
    SIGNUP = 'signup', 'Signup'


class EmailVerification(BaseModel):
    """OTP email verification before signup and other email-gated flows."""

    email = models.EmailField(db_index=True)
    purpose = models.CharField(
        max_length=32,
        choices=EmailVerificationPurpose.choices,
        default=EmailVerificationPurpose.SIGNUP,
    )
    otp_hash = models.CharField(max_length=128)
    expires_at = models.DateTimeField()
    verified_at = models.DateTimeField(null=True, blank=True)
    attempt_count = models.PositiveSmallIntegerField(default=0)
    resend_count = models.PositiveSmallIntegerField(default=0)
    last_sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'email_verifications'
        indexes = [
            models.Index(fields=['email', 'purpose', '-created_at']),
        ]

    @property
    def is_verified(self):
        return self.verified_at is not None

    @property
    def is_expired(self):
        return timezone.now() >= self.expires_at


class PasswordReset(BaseModel):
    """One-time password reset token (hashed)."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_resets')
    token_hash = models.CharField(max_length=128)
    expires_at = models.DateTimeField(db_index=True)
    used_at = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        db_table = 'password_resets'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

    @property
    def is_usable(self):
        return self.used_at is None and timezone.now() < self.expires_at


class StaffInvite(BaseModel):
    """Invite a staff member to set a password and access the admin portal."""

    email = models.EmailField(db_index=True)
    admin_role = models.CharField(max_length=32, choices=AdminRole.choices)
    invited_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='staff_invites_sent',
        db_column='invited_by_id',
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='staff_invites',
        db_column='user_id',
    )
    token_hash = models.CharField(max_length=128)
    expires_at = models.DateTimeField(db_index=True)
    accepted_at = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        db_table = 'staff_invites'
        ordering = ['-created_at']

    @property
    def is_usable(self):
        return self.accepted_at is None and timezone.now() < self.expires_at
