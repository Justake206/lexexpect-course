"""
Модели приложения users.
Здесь описываются структуры данных для хранения пользователей в БД.
"""

from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Расширенная модель пользователя.
    Наследуется от стандартной модели AbstractUser и добавляет новые поля.

    В стандартной модели уже есть: username, password, email, first_name, last_name, etc.
    Мы добавляем: user_type, bio, avatar, phone
    """

    # Выбор типа пользователя (роль в системе)
    USER_TYPE_CHOICES = (
        ('client', 'Клиент'),  # Обычный клиент (создает заявки)
        ('lawyer', 'Адвокат'),  # Адвокат (обрабатывает заявки)
        ('admin', 'Администратор'),  # Администратор (полный доступ)
    )

    # Тип пользователя - определяет права доступа
    # CharField - строковое поле, max_length=10 - максимум 10 символов
    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,  # Ограничиваем выбором из списка
        default='client',  # По умолчанию - клиент
        verbose_name='Тип пользователя'  # Название поля в админке
    )

    # Биография пользователя (о себе)
    # TextField - большое текстовое поле (неограниченной длины)
    bio = models.TextField(
        verbose_name='О себе',
        blank=True  # blank=True - поле может быть пустым
    )

    # Аватар пользователя
    # ImageField - поле для загрузки изображений
    # upload_to - папка для сохранения (с вложенными папками по дате)
    avatar = models.ImageField(
        upload_to='avatars/%Y/%m/%d',  # Сохраняется в media/avatars/2024/01/01/
        verbose_name='Аватар',
        blank=True,  # Может быть пустым
        null=True  # Может быть NULL в БД
    )

    # Номер телефона
    phone = models.CharField(
        max_length=20,
        verbose_name='Телефон',
        blank=True
    )

    class Meta:
        # Настройки модели для отображения в админке
        verbose_name = 'Пользователь'  # Единственное число
        verbose_name_plural = 'Пользователи'  # Множественное число

    def __str__(self):
        """
        Строковое представление объекта.
        Используется в админке и при выводе объектов.
        """
        return self.username

    # Свойства-помощники для проверки типа пользователя
    @property
    def is_lawyer(self):
        """Проверка, является ли пользователь адвокатом"""
        return self.user_type == 'lawyer'

    @property
    def is_client(self):
        """Проверка, является ли пользователь клиентом"""
        return self.user_type == 'client'