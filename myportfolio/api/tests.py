from unittest.mock import patch

from django.core import mail
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from contact.models import ContactMessage
from projects.models import Project


class ProjectsApiTests(APITestCase):
    def setUp(self):
        Project.objects.create(
            title="Project One",
            tech_stack=["Django", "JavaScript"],
            description="A featured project",
            live_url="https://example.com/live-1",
            github_url="https://example.com/repo-1",
            is_featured=True,
            sort_order=2,
        )
        Project.objects.create(
            title="Project Two",
            tech_stack=["Python"],
            description="Second featured project",
            live_url="https://example.com/live-2",
            github_url="https://example.com/repo-2",
            is_featured=True,
            sort_order=1,
        )
        Project.objects.create(
            title="Hidden Project",
            tech_stack=["Python"],
            description="Not featured",
            live_url="https://example.com/live-3",
            github_url="https://example.com/repo-3",
            is_featured=False,
            sort_order=0,
        )

    def test_get_projects_returns_featured_only_in_order(self):
        response = self.client.get("/api/projects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]["title"], "Project Two")
        self.assertEqual(response.data[1]["title"], "Project One")


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    CONTACT_RECEIVER_EMAIL="owner@example.com",
    DEFAULT_FROM_EMAIL="noreply@example.com",
)
class ContactApiTests(APITestCase):
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=True)

    def _csrf_headers(self):
        self.client.get("/api/csrf/")
        token = self.client.cookies.get("csrftoken").value
        return {"HTTP_X_CSRFTOKEN": token}

    def test_post_contact_creates_message_and_sends_email(self):
        payload = {
            "name": "Test User",
            "email": "test@example.com",
            "message": "This is a valid test message.",
        }
        response = self.client.post("/api/contact/", payload, format="json", **self._csrf_headers())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ContactMessage.objects.count(), 1)
        self.assertTrue(ContactMessage.objects.first().email_sent)
        self.assertEqual(len(mail.outbox), 1)

    def test_post_contact_without_csrf_returns_403(self):
        payload = {
            "name": "Test User",
            "email": "test@example.com",
            "message": "This is a valid test message.",
        }
        response = self.client.post("/api/contact/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_post_contact_invalid_payload_returns_400(self):
        payload = {
            "name": "A",
            "email": "not-an-email",
            "message": "short",
        }
        response = self.client.post("/api/contact/", payload, format="json", **self._csrf_headers())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_post_contact_email_failure_returns_502(self):
        payload = {
            "name": "Test User",
            "email": "test@example.com",
            "message": "This is another valid test message.",
        }
        with patch("api.views.send_mail", side_effect=RuntimeError("SMTP error")):
            response = self.client.post("/api/contact/", payload, format="json", **self._csrf_headers())

        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
        self.assertEqual(ContactMessage.objects.count(), 1)
        stored = ContactMessage.objects.first()
        self.assertFalse(stored.email_sent)
        self.assertIn("SMTP error", stored.notification_error)
