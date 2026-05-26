"""
Главный файл маршрутизации URL.
Здесь определяются все основные пути к приложениям.
"""

from django.contrib import admin  # Админ-панель
from django.urls import path, include  # Функции для маршрутизации
from django.conf import settings  # Настройки проекта
from django.conf.urls.static import static  # Для обслуживания медиафайлов

# urlpatterns - список маршрутов (путей) в приложении
urlpatterns = [
    # Админ-панель Django - доступна по /admin
    # Пример: http://127.0.0.1:8000/admin
    path('admin/', admin.site.urls),

    # API маршруты основного приложения (услуги, заявки, адвокаты)
    # Все API эндпоинты будут доступны по /api/...
    # Пример: http://127.0.0.1:8000/api/services/
    path('api/', include('backend.services.urls')),

    # API маршруты аутентификации (регистрация, логин, токены)
    # Пример: http://127.0.0.1:8000/api/auth/login/
    path('api/auth/', include('backend.users.urls')),
]

# Если режим отладки включен (DEBUG=True), добавляем маршруты для медиафайлов
# Это позволяет отображать загруженные изображения в разработке
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Добавляем обслуживание статических файлов для админки
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)