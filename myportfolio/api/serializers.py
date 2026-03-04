from django.core.validators import MinLengthValidator
from rest_framework import serializers

from contact.models import ContactMessage
from projects.models import Project


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = (
            "id",
            "title",
            "tech_stack",
            "description",
            "live_url",
            "github_url",
            "is_featured",
        )


class ContactMessageSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=120, validators=[MinLengthValidator(2)])
    message = serializers.CharField(validators=[MinLengthValidator(10)])

    class Meta:
        model = ContactMessage
        fields = ("name", "email", "message")
