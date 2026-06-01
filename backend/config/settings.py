"""
Django settings for LexExpect project.
Настройки проекта - главный конфигурационный файл
"""

from pathlib import Path
import os
from datetime import timedelta
from dotenv import load_dotenv

# Загрузка переменных окружения из файла .env (для безопасности)
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
# BASE_DIR - корневая папка проекта (C:\Projects\lexexpect)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
# Секретный ключ - НИКОГДА не публиковать в открытом доступе
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-lexexpect-key-2024')

# SECURITY WARNING: don't run with debug turned on in production!
# Режим отладки - показывает ошибки подробно (только для разработки)
DEBUG = True

# Разрешенные хосты для доступа к приложению
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '*']

# Application definition
# Список установленных приложений (модулей проекта)
INSTALLED_APPS = [
    # Стандартные приложения Django
    'django.contrib.admin',  # Админ-панель
    'django.contrib.auth',  # Аутентификация
    'django.contrib.contenttypes',  # Работа с типами контента
    'django.contrib.sessions',  # Управление сессиями
    'django.contrib.messages',  # Система сообщений
    'django.contrib.staticfiles',  # Статические файлы (CSS, JS)

    # Сторонние приложения (установлены через pip)
    'rest_framework',  # Django REST Framework
    'rest_framework_simplejwt',  # JWT аутентификация
    'corsheaders',  # CORS заголовки для API
    'channels',  # Django Channels для WebSocket

    # Локальные приложения (наши)
    'backend.services',  # Основное приложение (услуги, заявки)
    'backend.users',  # Приложение для пользователей
]

# Middleware - компоненты, обрабатывающие запросы на пути от браузера к серверу
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Обработка CORS (первым!)
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',  # Защита от CSRF атак
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Корневой URLconf - указывает на главный файл с маршрутами
ROOT_URLCONF = 'backend.config.urls'

# Настройки шаблонов (для админки и возможных страниц)
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ASGI - точка входа для WebSocket (Django Channels)
ASGI_APPLICATION = 'backend.config.asgi.application'

# WSGI - точка входа для веб-серверов (стандартный интерфейс)
WSGI_APPLICATION = 'backend.config.wsgi.application'

# Database
# Настройки базы данных - используем SQLite для разработки
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',  # Движок SQLite
        'NAME': BASE_DIR / 'db.sqlite3',  # Файл базы данных
    }
}

# Password validation
# Валидаторы паролей - проверяют надежность паролей
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# Настройки локализации (русский язык, московское время)
LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'Europe/Moscow'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# Статические файлы (CSS, JS, изображения)
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
# Медиафайлы (загруженные пользователями аватары, фото)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
# Тип поля первичного ключа по умолчанию
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom user model
# Используем кастомную модель пользователя (вместо стандартной)
AUTH_USER_MODEL = 'users.User'

# Django REST Framework settings
# Настройки DRF
REST_FRAMEWORK = {
    # Классы аутентификации - используем JWT
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    # Классы разрешений - только чтение для неавторизованных
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    # Пагинация - 6 записей на странице
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 6,
}

# JWT Settings
# Настройки JWT токенов
SIMPLE_JWT = {
    # Время жизни токенов
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),  # Access токен - 30 минут
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),  # Refresh токен - 1 день

    # Ротация токенов (при обновлении выдаем новый refresh)
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,  # Старый refresh в черный список

    # Алгоритм шифрования
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,

    # Заголовок для передачи токена
    'AUTH_HEADER_TYPES': ('Bearer',),  # Пример: Bearer <token>
}

# CORS Settings
# Разрешенные источники для API запросов (React приложение)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Локальный React сервер
    "http://127.0.0.1:3000",  # Альтернативный адрес
]

CORS_ALLOW_CREDENTIALS = True

# Channels (WebSocket) settings
# Настройки для WebSocket
CHANNEL_LAYERS = {
    'default': {
        # In-memory channel layer (для разработки, не используйте в продакшене)
        'BACKEND': 'channels.layers.InMemoryChannelLayer',

        # Для продакшена использовать Redis:
        # 'BACKEND': 'channels_redis.core.RedisChannelLayer',
        # 'CONFIG': {
        #     "hosts": [('127.0.0.1', 6379)],
        # },
    },
}