from django.contrib import admin

from projects.models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "is_featured", "sort_order", "updated_at")
    list_filter = ("is_featured",)
    search_fields = ("title", "description")
    ordering = ("sort_order", "id")
