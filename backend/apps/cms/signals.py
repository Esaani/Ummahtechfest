from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.cms.models import FeaturedSpeaker, FeaturedSponsor, MediaAsset, SiteSection, SponsorshipBenefitRow, SponsorshipPackage
from apps.cms.models import CmsPage
from apps.cms.services import CmsCacheService


@receiver([post_save, post_delete], sender=SiteSection)
def invalidate_cms_section_cache(sender, instance, **kwargs):
    try:
        CmsCacheService.invalidate_sections(instance.page)
    except Exception:
        pass


@receiver([post_save, post_delete], sender=MediaAsset)
def invalidate_cms_media_cache(sender, instance, **kwargs):
    try:
        for page_code, _ in CmsPage.choices:
            CmsCacheService.invalidate_sections(page_code)
    except Exception:
        pass


@receiver([post_save, post_delete], sender=FeaturedSpeaker)
def invalidate_speaker_cache(sender, instance, **kwargs):
    try:
        CmsCacheService.invalidate_speakers()
    except Exception:
        pass


@receiver([post_save, post_delete], sender=FeaturedSponsor)
def invalidate_sponsor_cache(sender, instance, **kwargs):
    try:
        CmsCacheService.invalidate_sponsors()
    except Exception:
        pass


@receiver([post_save, post_delete], sender=SponsorshipPackage)
@receiver([post_save, post_delete], sender=SponsorshipBenefitRow)
def invalidate_sponsorship_cache(sender, instance, **kwargs):
    try:
        CmsCacheService.invalidate_sponsorship()
    except Exception:
        pass
