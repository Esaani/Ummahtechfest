"""Admin portal roles and permission checks."""

from apps.accounts.models import AdminRole

# Permission keys returned on /auth/me/ and checked by HasAdminPermission
PERM_CMS_MANAGE = 'cms.manage'
PERM_SUBMISSIONS_MANAGE = 'submissions.manage'
PERM_USERS_MANAGE = 'users.manage'

ALL_ADMIN_PERMISSIONS = frozenset({
    PERM_CMS_MANAGE,
    PERM_SUBMISSIONS_MANAGE,
    PERM_USERS_MANAGE,
})

ROLE_PERMISSIONS = {
    AdminRole.CONTENT_MANAGER: frozenset({PERM_CMS_MANAGE}),
    AdminRole.SUBMISSIONS_REVIEWER: frozenset({PERM_SUBMISSIONS_MANAGE}),
    AdminRole.USER_MANAGER: frozenset({PERM_USERS_MANAGE}),
    AdminRole.OPERATIONS: frozenset({PERM_CMS_MANAGE, PERM_SUBMISSIONS_MANAGE}),
}


def get_admin_permissions(user) -> frozenset[str]:
    """Effective admin permissions for a user (superuser = all)."""
    if not user or not getattr(user, 'is_authenticated', False):
        return frozenset()
    if getattr(user, 'is_superuser', False):
        return ALL_ADMIN_PERMISSIONS
    role = getattr(user, 'admin_role', None)
    if not role:
        return frozenset()
    return ROLE_PERMISSIONS.get(role, frozenset())


def user_has_admin_permission(user, permission: str) -> bool:
    return permission in get_admin_permissions(user)


def user_can_access_admin_portal(user) -> bool:
    return bool(get_admin_permissions(user))
