from django.contrib import admin

from apps.volunteers.models import (
    VolunteerApplication,
    VolunteerApplicationStatus,
    VolunteerApplicationStatusHistory,
    VolunteerRole,
)
from apps.volunteers.services import VolunteerRoleCacheService


@admin.register(VolunteerRole)
class VolunteerRoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'category', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        VolunteerRoleCacheService.invalidate()


class StatusHistoryInline(admin.TabularInline):
    model = VolunteerApplicationStatusHistory
    extra = 0
    readonly_fields = ('from_status', 'to_status', 'changed_by', 'note', 'created_at')


@admin.register(VolunteerApplication)
class VolunteerApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'city', 'country', 'created_at')
    list_filter = ('status', 'country')
    search_fields = ('user__email', 'skills_summary', 'city')
    inlines = [StatusHistoryInline]
    readonly_fields = ('created_at', 'updated_at')

    def save_model(self, request, obj, form, change):
        old_status = None
        if change and obj.pk:
            old = VolunteerApplication.objects.filter(pk=obj.pk).values_list('status', flat=True).first()
            old_status = old
        super().save_model(request, obj, form, change)
        if change and old_status and old_status != obj.status:
            VolunteerApplicationStatusHistory.objects.create(
                application=obj,
                from_status=old_status,
                to_status=obj.status,
                changed_by=request.user,
                note='Updated via admin',
            )
