"""
Права доступа для API приложения services
"""

from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """Только администраторы могут создавать, изменять и удалять"""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class IsAuthorOrReadOnly(permissions.BasePermission):
    """Только автор может изменять и удалять свои записи"""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if hasattr(obj, 'client'):
            return obj.client == request.user
        return request.user.is_staff


class IsAssignedLawyerOrAdmin(permissions.BasePermission):
    """Только назначенный адвокат или админ могут менять статус заявки"""

    def has_object_permission(self, request, view, obj):
        # Админ может всё
        if request.user.is_staff:
            return True

        # Проверяем, что пользователь - адвокат и он назначен на эту заявку
        if request.user.user_type == 'lawyer':
            if hasattr(obj, 'lawyer') and obj.lawyer and obj.lawyer.user == request.user:
                return True

        return False


class IsCaseClientOrAdmin(permissions.BasePermission):
    """Только клиент или админ могут удалять/редактировать заявку"""

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        if hasattr(obj, 'client') and obj.client == request.user:
            return True
        return False


class CanAcceptCase(permissions.BasePermission):
    """Адвокат может принять заявку, если она новая"""

    def has_permission(self, request, view):
        if request.user.is_staff:
            return True
        return request.user.user_type == 'lawyer'

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        if obj.status != 'new':
            return False
        if request.user.user_type != 'lawyer':
            return False
        if obj.client == request.user:
            return False
        return True