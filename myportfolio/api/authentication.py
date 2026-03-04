from rest_framework.authentication import SessionAuthentication


class CsrfEnforcedSessionAuthentication(SessionAuthentication):
    def authenticate(self, request):
        self.enforce_csrf(request)
        return None
