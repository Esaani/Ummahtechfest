"""Publish accepted speaker applications to the homepage featured speakers list."""

import logging

from apps.cms.models import FeaturedSpeaker
from apps.cms.services import CmsCacheService
from apps.outreach.models import SpeakerApplication, SpeakerApplicationStatus

logger = logging.getLogger('ummah_tech_fest')


def _speaker_role_line(application):
    title = (application.professional_title or '').strip()
    org = (application.organization or '').strip()
    if title and org:
        return f'{title} · {org}'[:255]
    return (title or org)[:255]


def sync_featured_speaker_from_application(application):
    """Create or update homepage speaker card when application status changes."""
    if not isinstance(application, SpeakerApplication):
        application = SpeakerApplication.objects.select_related('profile_image_asset').get(
            pk=application.pk,
        )

    featured = FeaturedSpeaker.objects.filter(speaker_application=application).first()

    if application.status == SpeakerApplicationStatus.ACCEPTED:
        if not featured:
            featured = FeaturedSpeaker(speaker_application=application)
        featured.name = application.full_name
        featured.role = _speaker_role_line(application)
        featured.bio = application.bio
        featured.image_asset = application.profile_image_asset
        featured.image_url = ''
        featured.is_published = True
        featured.save()
        logger.info(
            'featured_speaker_published application_id=%s featured_id=%s',
            application.id,
            featured.id,
        )
    elif featured:
        featured.is_published = False
        featured.save(update_fields=['is_published', 'updated_at'])
        logger.info(
            'featured_speaker_unpublished application_id=%s featured_id=%s status=%s',
            application.id,
            featured.id,
            application.status,
        )

    CmsCacheService.invalidate_speakers()
