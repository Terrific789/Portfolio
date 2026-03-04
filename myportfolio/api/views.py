from django.conf import settings
from django.core.mail import send_mail
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.authentication import CsrfEnforcedSessionAuthentication
from api.serializers import ContactMessageSerializer, ProjectSerializer
from projects.models import Project


@ensure_csrf_cookie
def csrf_token_view(request):
    return JsonResponse({"csrfToken": get_token(request)})


class ProjectListAPIView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    queryset = Project.objects.filter(is_featured=True).order_by("sort_order", "id")


class ContactCreateAPIView(APIView):
    authentication_classes = [CsrfEnforcedSessionAuthentication]

    def post(self, request, *args, **kwargs):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()

        subject = "New portfolio contact message"
        body = (
            f"Name: {message.name}\n"
            f"Email: {message.email}\n\n"
            f"Message:\n{message.message}"
        )

        try:
            send_mail(
                subject=subject,
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.CONTACT_RECEIVER_EMAIL],
                fail_silently=False,
            )
            message.email_sent = True
            message.notification_error = ""
            message.save(update_fields=["email_sent", "notification_error"])
            return Response({"detail": "Message sent successfully."}, status=status.HTTP_201_CREATED)
        except Exception as exc:  # pragma: no cover
            message.email_sent = False
            message.notification_error = str(exc)
            message.save(update_fields=["email_sent", "notification_error"])
            return Response(
                {
                    "detail": (
                        "Message saved, but email notification failed. "
                        "Please try again later."
                    )
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )
