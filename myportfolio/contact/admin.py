from django.contrib import admin

from contact.models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "email_sent", "created_at")
    list_filter = ("email_sent", "created_at")
    search_fields = ("name", "email", "message")
    readonly_fields = ("name", "email", "message", "email_sent", "notification_error", "created_at")
