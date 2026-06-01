"""
Модели основного приложения services.
Здесь описываются: Услуги, Адвокаты, Заявки, Отзывы.
"""

from django.db import models
from django.conf import settings  # Для доступа к модели пользователя


class Service(models.Model):
    """
    Модель юридической услуги.
    Пример: "Консультация юриста", "Составление договора" и т.д.
    """

    # Название услуги (обязательное поле, максимум 200 символов)
    title = models.CharField(
        max_length=200,
        verbose_name='Название услуги'
    )

    # URL-идентификатор (человеко-читаемый URL)
    # unique=True - значение должно быть уникальным
    slug = models.SlugField(
        max_length=200,
        unique=True,
        verbose_name='URL',
        blank=True  # Может быть пустым - заполнится автоматически
    )

    # Описание услуги (большой текст)
    description = models.TextField(verbose_name='Описание')

    # Стоимость услуги (десятичное число: 10 знаков, 2 после запятой)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Стоимость'
    )

    # Иконка для отображения (CSS класс или emoji)
    icon = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='Иконка'
    )

    # Флаг активности (можно скрыть услугу не удаляя)
    is_active = models.BooleanField(
        default=True,
        verbose_name='Активна'
    )

    # Дата создания (заполняется автоматически при создании)
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )

    class Meta:
        verbose_name = 'Услуга'
        verbose_name_plural = 'Услуги'
        ordering = ['title']  # Сортировка по названию

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        """
        Переопределяем метод сохранения.
        Если slug не указан, создаем его из названия автоматически.
        Пример: "Консультация юриста" -> "konsultatsiya-yurista"
        """
        if not self.slug:
            # Заменяем пробелы на дефисы и приводим к нижнему регистру
            self.slug = self.title.lower().replace(' ', '-')
        super().save(*args, **kwargs)


class Lawyer(models.Model):
    """
    Модель адвоката.
    Связана с моделью User через OneToOneField (один к одному).
    """

    # Связь с пользователем (один к одному)
    # on_delete=CASCADE - при удалении пользователя удалится и адвокат
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lawyer_profile',  # Обратная связь: user.lawyer_profile
        verbose_name='Пользователь'
    )

    # Специализация (гражданское, уголовное, корпоративное и т.д.)
    specialization = models.CharField(
        max_length=100,
        verbose_name='Специализация'
    )

    # Опыт работы в годах
    experience = models.IntegerField(verbose_name='Опыт (лет)')

    # Биография адвоката (образование, достижения)
    bio = models.TextField(verbose_name='О себе')

    # Фото адвоката
    photo = models.ImageField(
        upload_to='lawyers/',
        blank=True,
        null=True,
        verbose_name='Фото'
    )

    # Рейтинг адвоката (вычисляется из отзывов)
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        verbose_name='Рейтинг'
    )

    # Флаг верификации (подтвержденный адвокат)
    is_verified = models.BooleanField(
        default=False,
        verbose_name='Верифицирован'
    )

    class Meta:
        verbose_name = 'Адвокат'
        verbose_name_plural = 'Адвокаты'

    def __str__(self):
        # Возвращаем полное имя пользователя
        return f"{self.user.first_name} {self.user.last_name}"

    @property
    def full_name(self):
        """Свойство для получения полного имени"""
        return f"{self.user.first_name} {self.user.last_name}"


class Case(models.Model):
    """
    Модель заявки/дела.
    Это основная сущность - клиент создает заявку на услугу.
    """

    # Статусы заявки (выбор из предопределенных значений)
    STATUS_CHOICES = (
        ('new', 'Новая'),          # Только создана
        ('pending', 'На рассмотрении'),  # Адвокат рассматривает
        ('accepted', 'Принята'),   # Адвокат принял заявку
        ('rejected', 'Отклонена'), # Отклонена (всеми адвокатами)
        ('in_progress', 'В работе'),    # Адвокат работает
        ('completed', 'Завершена'),     # Работа завершена
        ('cancelled', 'Отменена'),      # Отменена клиентом/админом
    )

    # Клиент - кто создал заявку (связь с User)
    # on_delete=CASCADE - при удалении пользователя удалятся и его заявки
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cases',  # Обратная связь: user.cases
        verbose_name='Клиент'
    )

    # Адвокат - кто будет вести дело (может быть не назначен)
    # on_delete=SET_NULL - при удалении адвоката поле станет NULL
    lawyer = models.ForeignKey(
        Lawyer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cases',  # Обратная связь: lawyer.cases
        verbose_name='Адвокат'
    )

    # Услуга - на какую услугу заявка
    # on_delete=PROTECT - нельзя удалить услугу, если есть связанные заявки
    service = models.ForeignKey(
        Service,
        on_delete=models.PROTECT,
        related_name='cases',  # Обратная связь: service.cases
        verbose_name='Услуга'
    )

    # Тема обращения (краткое описание)
    title = models.CharField(max_length=200, verbose_name='Тема обращения')

    # Описание проблемы (подробно)
    description = models.TextField(verbose_name='Описание проблемы')

    # Статус заявки (с значением по умолчанию 'new')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='new',
        verbose_name='Статус'
    )

    # Дата создания (автоматически при создании)
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )

    # Дата обновления (автоматически при каждом сохранении)
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )

    # Адвокаты, которые отклонили эту заявку
    rejected_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name='rejected_cases',
        verbose_name='Отклонившие адвокаты'
    )

    class Meta:
        verbose_name = 'Заявка'
        verbose_name_plural = 'Заявки'
        ordering = ['-created_at']  # Сортировка по дате (новые сверху)

    def __str__(self):
        return f"Заявка #{self.id} - {self.title}"

    def save(self, *args, **kwargs):
        """
        Переопределяем метод сохранения.
        Если статус меняется с 'rejected' на 'new' — очищаем список отклонивших адвокатов.
        Это позволяет админу "возродить" заявку после того, как все адвокаты её отклонили.
        """
        if self.pk:
            try:
                old_instance = Case.objects.get(pk=self.pk)
                if old_instance.status == 'rejected' and self.status == 'new':
                    self.rejected_by.clear()
            except Case.DoesNotExist:
                pass
        super().save(*args, **kwargs)


class Review(models.Model):
    """
    Модель отзыва.
    Клиент оставляет отзыв на адвоката после завершения заявки.
    """

    # Связь с заявкой (один к одному - у заявки может быть только один отзыв)
    # on_delete=CASCADE - при удалении заявки удалится и отзыв
    case = models.OneToOneField(
        Case,
        on_delete=models.CASCADE,
        related_name='review',  # Обратная связь: case.review
        verbose_name='Заявка'
    )

    # Клиент - кто оставил отзыв
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews',  # Обратная связь: user.reviews
        verbose_name='Клиент'
    )

    # Адвокат - на кого отзыв
    lawyer = models.ForeignKey(
        Lawyer,
        on_delete=models.CASCADE,
        related_name='reviews',  # Обратная связь: lawyer.reviews
        verbose_name='Адвокат'
    )

    # Оценка от 1 до 5
    rating = models.IntegerField(
        choices=[(1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, '5')],
        verbose_name='Оценка'
    )

    # Текст отзыва
    text = models.TextField(verbose_name='Текст отзыва')

    # Дата создания отзыва
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )

    class Meta:
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'

    def __str__(self):
        return f"Отзыв от {self.client.username} на заявку #{self.case.id}"