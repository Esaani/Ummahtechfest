from django.contrib import admin

from apps.registrations.models import PassRegistration, PassType


@admin.register(PassType)
class PassTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'flow', 'is_active', 'is_open_for_registration')
    list_filter = ('flow', 'is_active')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(PassRegistration)
class PassRegistrationAdmin(admin.ModelAdmin):
    list_display = ('user', 'pass_type', 'status', 'organization', 'created_at')
    list_filter = ('status', 'pass_type')
    search_fields = ('user__email', 'organization', 'job_title')
