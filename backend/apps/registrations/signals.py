from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from apps.registrations.models import PassRegistration
from apps.registrations.services import DashboardCacheService

@receiver([post_save, post_delete], sender=PassRegistration)
def invalidate_dashboard_on_registration_change(sender, instance, **kwargs):
    DashboardCacheService.invalidate()

# Lazy imports for other apps to avoid circular dependencies
@receiver([post_save, post_delete], sender='outreach.SpeakerApplication')
def invalidate_dashboard_on_speaker_change(sender, instance, **kwargs):
    DashboardCacheService.invalidate()

@receiver([post_save, post_delete], sender='outreach.SponsorInquiry')
def invalidate_dashboard_on_sponsor_change(sender, instance, **kwargs):
    DashboardCacheService.invalidate()

@receiver([post_save, post_delete], sender='volunteers.VolunteerApplication')
def invalidate_dashboard_on_volunteer_change(sender, instance, **kwargs):
    DashboardCacheService.invalidate()

@receiver([post_save, post_delete], sender='payments.Payment')
def invalidate_dashboard_on_payment_change(sender, instance, **kwargs):
    DashboardCacheService.invalidate()

@receiver([post_save, post_delete], sender='payments.Donation')
def invalidate_dashboard_on_donation_change(sender, instance, **kwargs):
    DashboardCacheService.invalidate()

@receiver([post_save, post_delete], sender='cms.ScheduleSession')
def invalidate_dashboard_on_schedule_change(sender, instance, **kwargs):
    DashboardCacheService.invalidate()
