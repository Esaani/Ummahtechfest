import logging

from django.core.cache import cache
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cms.models import (
    FeaturedSpeaker,
    FeaturedSponsor,
    MediaAsset,
    ScheduleSession,
    SiteSection,
    SponsorshipBenefitRow,
    SponsorshipPackage,
)
from apps.cms.serializers import (
    FeaturedSpeakerAdminSerializer,
    FeaturedSpeakerPublicSerializer,
    FeaturedSponsorAdminSerializer,
    FeaturedSponsorPublicSerializer,
    MediaAssetSerializer,
    MediaAssetUploadSerializer,
    ScheduleSessionAdminSerializer,
    ScheduleSessionPublicSerializer,
    SiteSectionAdminSerializer,
    SiteSectionPublicSerializer,
    SponsorshipBenefitRowAdminSerializer,
    SponsorshipPackageAdminSerializer,
)
from apps.cms.sponsorship import build_public_sponsorship_payload, sponsor_page_hero
from apps.cms.section_media import publish_section_content
from apps.cms.services import CmsCacheService
from common.admin_roles import PERM_CMS_MANAGE
from common.permissions import HasAdminPermission

logger = logging.getLogger('ummah_tech_fest')


def _sections_queryset(page=None, published_only=True):
    qs = SiteSection.objects.all()
    if page:
        qs = qs.filter(page=page)
    if published_only:
        qs = qs.filter(is_published=True)
    return qs.order_by('sort_order', 'slug')


def _resolve_public_sections(data, request):
    """Re-resolve media URLs (R2 vs local) on every response, including cache hits."""
    resolved = []
    for item in data:
        row = dict(item)
        row['content'] = publish_section_content(row.get('content') or {}, request)
        resolved.append(row)
    return resolved


class PublicSectionListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        page = request.query_params.get('page')
        cache_key = CmsCacheService.sections_key(page)
        cached = cache.get(cache_key)
        if cached is not None:
            return Response({
                'data': _resolve_public_sections(cached, request),
                'meta': {'cached': True},
            })

        sections = _sections_queryset(page=page, published_only=True)
        data = SiteSectionPublicSerializer(sections, many=True, context={'request': request}).data
        cache.set(cache_key, data, timeout=300)
        return Response({'data': data, 'meta': {'cached': False}})


class PublicSectionDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        section = get_object_or_404(SiteSection, slug=slug, is_published=True)
        return Response({'data': SiteSectionPublicSerializer(section).data})


class AdminSectionListCreateView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_CMS_MANAGE

    def get(self, request):
        page = request.query_params.get('page')
        sections = _sections_queryset(page=page, published_only=False)
        return Response({'data': SiteSectionAdminSerializer(sections, many=True).data})

    def post(self, request):
        serializer = SiteSectionAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        section = serializer.save()
        logger.info('cms_section_created slug=%s user_id=%s', section.slug, request.user.id)
        return Response({'data': SiteSectionAdminSerializer(section).data}, status=status.HTTP_201_CREATED)


class AdminSectionDetailView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_CMS_MANAGE

    def get(self, request, section_id):
        section = get_object_or_404(SiteSection, id=section_id)
        return Response({'data': SiteSectionAdminSerializer(section).data})

    def patch(self, request, section_id):
        section = get_object_or_404(SiteSection, id=section_id)
        serializer = SiteSectionAdminSerializer(section, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        section = serializer.save()
        logger.info('cms_section_updated slug=%s user_id=%s', section.slug, request.user.id)
        return Response({'data': SiteSectionAdminSerializer(section).data})

    def delete(self, request, section_id):
        section = get_object_or_404(SiteSection, id=section_id)
        slug = section.slug
        section.delete()
        logger.info('cms_section_soft_deleted slug=%s user_id=%s', slug, request.user.id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminMediaListCreateView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_CMS_MANAGE
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        folder = request.query_params.get('folder')
        qs = MediaAsset.objects.select_related('uploaded_by').all()
        if folder:
            qs = qs.filter(folder=folder)
        return Response({
            'data': MediaAssetSerializer(qs[:100], many=True, context={'request': request}).data,
        })

    def post(self, request):
        serializer = MediaAssetUploadSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        asset = serializer.save()
        logger.info('cms_media_uploaded id=%s user_id=%s', asset.id, request.user.id)
        return Response(
            {'data': MediaAssetSerializer(asset, context={'request': request}).data},
            status=status.HTTP_201_CREATED,
        )


class AdminMediaDetailView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_CMS_MANAGE

    def delete(self, request, asset_id):
        asset = get_object_or_404(MediaAsset, id=asset_id)
        asset.delete()
        logger.info('cms_media_soft_deleted id=%s user_id=%s', asset_id, request.user.id)
        return Response(status=status.HTTP_204_NO_CONTENT)


def _published_speakers():
    return (
        FeaturedSpeaker.objects.filter(is_published=True)
        .select_related('image_asset')
        .order_by('sort_order', 'name')
    )


def _published_sponsors(tier=None):
    qs = FeaturedSponsor.objects.filter(is_published=True).select_related('logo_asset')
    if tier:
        qs = qs.filter(tier=tier)
    return qs.order_by('sort_order', 'name')


class PublicSpeakerListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cache_key = CmsCacheService.speakers_key()
        cached = cache.get(cache_key)
        if cached is not None:
            return Response({'data': cached, 'meta': {'cached': True}})
        speakers = _published_speakers()
        data = FeaturedSpeakerPublicSerializer(speakers, many=True, context={'request': request}).data
        cache.set(cache_key, data, timeout=300)
        return Response({'data': data, 'meta': {'cached': False}})


class AdminSpeakerListCreateView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_CMS_MANAGE

    def get(self, request):
        speakers = FeaturedSpeaker.objects.select_related('image_asset').order_by('sort_order', 'name')
        return Response({
            'data': FeaturedSpeakerAdminSerializer(speakers, many=True, context={'request': request}).data,
        })

    def post(self, request):
        serializer = FeaturedSpeakerAdminSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        speaker = serializer.save()
        CmsCacheService.invalidate_speakers()
        logger.info('cms_speaker_created id=%s user_id=%s', speaker.id, request.user.id)
        return Response(
            {'data': FeaturedSpeakerAdminSerializer(speaker, context={'request': request}).data},
            status=status.HTTP_201_CREATED,
        )


class AdminSpeakerDetailView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_CMS_MANAGE

    def patch(self, request, speaker_id):
        speaker = get_object_or_404(FeaturedSpeaker, id=speaker_id)
        serializer = FeaturedSpeakerAdminSerializer(
            speaker, data=request.data, partial=True, context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        speaker = serializer.save()
        CmsCacheService.invalidate_speakers()
        return Response({'data': FeaturedSpeakerAdminSerializer(speaker, context={'request': request}).data})

    def delete(self, request, speaker_id):
        speaker = get_object_or_404(FeaturedSpeaker, id=speaker_id)
        speaker.delete()
        CmsCacheService.invalidate_speakers()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PublicSponsorListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        tier = request.query_params.get('tier')
        cache_key = CmsCacheService.sponsors_key(tier)
        cached = cache.get(cache_key)
        if cached is not None:
            return Response({'data': cached, 'meta': {'cached': True}})
        sponsors = _published_sponsors(tier=tier or None)
        data = FeaturedSponsorPublicSerializer(sponsors, many=True, context={'request': request}).data
        cache.set(cache_key, data, timeout=300)
        return Response({'data': data, 'meta': {'cached': False}})


class AdminSponsorListCreateView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_CMS_MANAGE

    def get(self, request):
        tier = request.query_params.get('tier')
        qs = FeaturedSponsor.objects.select_related('logo_asset').order_by('sort_order', 'name')
        if tier:
            qs = qs.filter(tier=tier)
        return Response({
            'data': FeaturedSponsorAdminSerializer(qs, many=True, context={'request': request}).data,
        })

    def post(self, request):
        serializer = FeaturedSponsorAdminSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        sponsor = serializer.save()
        CmsCacheService.invalidate_sponsors()
        logger.info('cms_sponsor_created id=%s user_id=%s', sponsor.id, request.user.id)
        return Response(
            {'data': FeaturedSponsorAdminSerializer(sponsor, context={'request': request}).data},
            status=status.HTTP_201_CREATED,
        )


class AdminSponsorDetailView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_CMS_MANAGE

    def patch(self, request, sponsor_id):
        sponsor = get_object_or_404(FeaturedSponsor, id=sponsor_id)
        serializer = FeaturedSponsorAdminSerializer(
            sponsor, data=request.data, partial=True, context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        sponsor = serializer.save()
        CmsCacheService.invalidate_sponsors()
        return Response({'data': FeaturedSponsorAdminSerializer(sponsor, context={'request': request}).data})

    def delete(self, request, sponsor_id):
        sponsor = get_object_or_404(FeaturedSponsor, id=sponsor_id)
        sponsor.delete()
        CmsCacheService.invalidate_sponsors()
        return Response(status=status.HTTP_204_NO_CONTENT)


def _published_schedule(home_only=False):
    qs = ScheduleSession.objects.filter(is_published=True)
    if home_only:
        qs = qs.filter(show_on_home=True)
    return qs.order_by('event_day', 'sort_order', 'starts_at_time', 'title')


class PublicScheduleListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        home_only = request.query_params.get('home') == '1'
        cache_key = CmsCacheService.schedule_key(home_only=home_only)
        cached = cache.get(cache_key)
        if cached is not None:
            return Response({'data': cached, 'meta': {'cached': True}})

        sessions = _published_schedule(home_only=home_only)
        data = ScheduleSessionPublicSerializer(sessions, many=True).data
        cache.set(cache_key, data, timeout=300)
        return Response({'data': data, 'meta': {'cached': False}})


class AdminScheduleListCreateView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_CMS_MANAGE

    def get(self, request):
        qs = ScheduleSession.objects.all().order_by('event_day', 'sort_order', 'starts_at_time')
        day = request.query_params.get('day')
        if day:
            qs = qs.filter(event_day=int(day))
        return Response({'data': ScheduleSessionAdminSerializer(qs, many=True).data})

    def post(self, request):
        serializer = ScheduleSessionAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = serializer.save()
        CmsCacheService.invalidate_schedule()
        logger.info('cms_schedule_created id=%s user_id=%s', session.id, request.user.id)
        return Response(
            {'data': ScheduleSessionAdminSerializer(session).data},
            status=status.HTTP_201_CREATED,
        )


class PublicSponsorshipView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cache_key = CmsCacheService.sponsorship_key()
        cached = cache.get(cache_key)
        if cached is not None:
            data = dict(cached)
            data['hero'] = sponsor_page_hero(request)
            return Response({'data': data, 'meta': {'cached': True}})
        data = build_public_sponsorship_payload(request)
        cache.set(cache_key, data, timeout=300)
        return Response({'data': data, 'meta': {'cached': False}})


class AdminSponsorshipPackageListCreateView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_CMS_MANAGE

    def get(self, request):
        qs = SponsorshipPackage.objects.all().order_by('sort_order', 'name')
        return Response({'data': SponsorshipPackageAdminSerializer(qs, many=True).data})

    def post(self, request):
        serializer = SponsorshipPackageAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        package = serializer.save()
        CmsCacheService.invalidate_sponsorship()
        logger.info('cms_sponsorship_package_created slug=%s user_id=%s', package.slug, request.user.id)
        return Response(
            {'data': SponsorshipPackageAdminSerializer(package).data},
            status=status.HTTP_201_CREATED,
        )


class AdminSponsorshipPackageDetailView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_CMS_MANAGE

    def patch(self, request, package_id):
        package = get_object_or_404(SponsorshipPackage, id=package_id)
        serializer = SponsorshipPackageAdminSerializer(package, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        package = serializer.save()
        CmsCacheService.invalidate_sponsorship()
        return Response({'data': SponsorshipPackageAdminSerializer(package).data})

    def delete(self, request, package_id):
        package = get_object_or_404(SponsorshipPackage, id=package_id)
        package.delete()
        CmsCacheService.invalidate_sponsorship()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminSponsorshipBenefitRowListCreateView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_CMS_MANAGE

    def get(self, request):
        qs = SponsorshipBenefitRow.objects.all().order_by('sort_order', 'label')
        return Response({'data': SponsorshipBenefitRowAdminSerializer(qs, many=True).data})

    def post(self, request):
        serializer = SponsorshipBenefitRowAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        row = serializer.save()
        CmsCacheService.invalidate_sponsorship()
        return Response(
            {'data': SponsorshipBenefitRowAdminSerializer(row).data},
            status=status.HTTP_201_CREATED,
        )


class AdminSponsorshipBenefitRowDetailView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_CMS_MANAGE

    def patch(self, request, row_id):
        row = get_object_or_404(SponsorshipBenefitRow, id=row_id)
        serializer = SponsorshipBenefitRowAdminSerializer(row, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        row = serializer.save()
        CmsCacheService.invalidate_sponsorship()
        return Response({'data': SponsorshipBenefitRowAdminSerializer(row).data})

    def delete(self, request, row_id):
        row = get_object_or_404(SponsorshipBenefitRow, id=row_id)
        row.delete()
        CmsCacheService.invalidate_sponsorship()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminScheduleDetailView(APIView):
    permission_classes = [HasAdminPermission]
    admin_permission = PERM_CMS_MANAGE

    def patch(self, request, session_id):
        session = get_object_or_404(ScheduleSession, id=session_id)
        serializer = ScheduleSessionAdminSerializer(session, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        session = serializer.save()
        CmsCacheService.invalidate_schedule()
        return Response({'data': ScheduleSessionAdminSerializer(session).data})

    def delete(self, request, session_id):
        session = get_object_or_404(ScheduleSession, id=session_id)
        session.delete()
        CmsCacheService.invalidate_schedule()
        return Response(status=status.HTTP_204_NO_CONTENT)
