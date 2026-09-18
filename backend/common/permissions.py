from rest_framework.permissions import BasePermission
from users.models import User


class IsTurfOwnerOrAdmin(BasePermission):
    """
    Permission check: Allows access only to Turf Owners and Admins.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in [User.Role.TURF_OWNER, User.Role.ADMIN]
        )


class IsAdminUser(BasePermission):
    """
    Permission check: Allows access only to Admins.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.ADMIN
        )
