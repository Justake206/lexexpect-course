"""
Настройка админ-панели для приложения services
"""

from django.contrib import admin
from .models import Service, Lawyer, Case, Review


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    """Админ-панель для услуг"""
    list_display = ('id', 'title', 'price', 'is_active', 'created_at')
    list_display_links = ('id', 'title')
    list_editable = ('is_active',)
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    list_filter = ('is_active', 'created_at')


@admin.register(Lawyer)
class LawyerAdmin(admin.ModelAdmin):
    """Админ-панель для адвокатов"""
    list_display = ('id', 'full_name', 'specialization', 'experience', 'rating', 'is_verified')
    list_display_links = ('id', 'full_name')
    list_editable = ('is_verified',)
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'specialization')
    list_filter = ('specialization', 'is_verified', 'experience')

    def full_name(self, obj):
        return obj.full_name

    full_name.short_description = 'ФИО'


@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    """Админ-панель для заявок"""
    list_display = ('id', 'title', 'client', 'lawyer', 'service', 'status', 'created_at')
    list_display_links = ('id', 'title')
    list_filter = ('status', 'service', 'created_at')
    search_fields = ('title', 'description', 'client__username')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'description', 'service', 'client')
        }),
        ('Статус и назначения', {
            'fields': ('status', 'lawyer')
        }),
        ('Системные поля', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """Админ-панель для отзывов"""
    list_display = ('id', 'case', 'client', 'lawyer', 'rating', 'created_at')
    list_display_links = ('id', 'case')
    list_filter = ('rating', 'created_at')
    search_fields = ('client__username', 'lawyer__user__username', 'text')
    readonly_fields = ('created_at',)