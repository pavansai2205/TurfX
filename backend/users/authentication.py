from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed


class FlexibleJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication class that safely handles invalid/expired tokens.
    If an invalid or expired token is passed, it falls back to unauthenticated (None)
    instead of throwing a 401 error before permission classes can evaluate.
    """
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except (InvalidToken, AuthenticationFailed):
            # Fall back to unauthenticated request so public (AllowAny) views still load
            return None
