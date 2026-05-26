"""
Настройка админ-панели для приложения users
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """Кастомная админ-панель для модели пользователя"""

    list_display = ('username', 'email', 'user_type', 'first_name', 'last_name', 'is_staff')
    list_display_links = ('username',)
    list_filter = ('user_type', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')

    fieldsets = UserAdmin.fieldsets + (
        ('Дополнительная информация', {
            'fields': ('user_type', 'bio', 'avatar', 'phone')
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Дополнительная информация', {
            'fields': ('user_type', 'bio', 'avatar', 'phone')
        }),
    )