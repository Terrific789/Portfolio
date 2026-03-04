from django.urls import path

from api.views import ContactCreateAPIView, ProjectListAPIView, csrf_token_view

urlpatterns = [
    path("csrf/", csrf_token_view, name="csrf-token"),
    path("projects/", ProjectListAPIView.as_view(), name="projects-list"),
    path("contact/", ContactCreateAPIView.as_view(), name="contact-create"),
]
