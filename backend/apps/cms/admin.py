from django.contrib import admin

from apps.cms.models import MediaAsset, SiteSection


@admin.register(SiteSection)
class SiteSectionAdmin(admin.ModelAdmin):
    list_display = ('slug', 'page', 'label', 'is_published', 'sort_order', 'updated_at')
    list_filter = ('page', 'is_published')
    search_fields = ('slug', 'label')
    prepopulated_fields = {'slug': ('label',)}


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ('title', 'folder', 'mime_type', 'file_size', 'created_at')
    list_filter = ('folder',)
    search_fields = ('title', 'alt_text')
