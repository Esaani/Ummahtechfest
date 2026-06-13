from django.contrib import admin

from apps.outreach.models import NewsletterSubscriber, SpeakerApplication, SponsorInquiry, TicketWaitlist


@admin.register(SponsorInquiry)
class SponsorInquiryAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'full_name', 'email', 'tier_interest', 'status', 'created_at')
    list_filter = ('status', 'tier_interest')
    search_fields = ('company_name', 'full_name', 'email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(SpeakerApplication)
class SpeakerApplicationAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'session_title', 'track', 'session_format', 'status', 'created_at')
    list_filter = ('status', 'track', 'session_format')
    search_fields = ('full_name', 'email', 'session_title')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(TicketWaitlist)
class TicketWaitlistAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'tier_interest', 'status', 'created_at')
    list_filter = ('status', 'tier_interest')
    search_fields = ('full_name', 'email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('email',)
    readonly_fields = ('created_at', 'updated_at')
