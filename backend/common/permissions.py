from rest_framework.permissions import BasePermission

from common.admin_roles import user_has_admin_permission


class IsSuperUser(BasePermission):
    """Django superuser only (legacy CMS endpoints during migration)."""

    message = 'Superadmin access required.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)


class HasAdminPermission(BasePermission):
    """
    Superusers always pass. Otherwise requires an admin_role that grants
    view.admin_permission (set on the APIView subclass).
    """

    message = 'You do not have permission to perform this action.'

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        permission = getattr(view, 'admin_permission', None)
        if not permission:
            return False
        return user_has_admin_permission(user, permission)


class HasAnyAdminPermission(BasePermission):
    """User may access the admin portal (any admin permission or superuser)."""

    message = 'Admin portal access required.'

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        from common.admin_roles import user_can_access_admin_portal

        return user_can_access_admin_portal(user)
