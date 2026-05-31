"""
Сериализаторы для приложения services
"""

from rest_framework import serializers
from .models import Service, Lawyer, Case, Review


class ServiceSerializer(serializers.ModelSerializer):
    """
    Сериализатор для модели Service (Услуги)
    """

    class Meta:
        model = Service
        fields = ['id', 'title', 'slug', 'description', 'price', 'icon', 'is_active', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']


class LawyerSerializer(serializers.ModelSerializer):
    """
    Сериализатор для модели Lawyer (Адвокаты)
    """
    full_name = serializers.CharField(read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Lawyer
        fields = ['id', 'user', 'user_id', 'username', 'full_name', 'specialization',
                  'experience', 'bio', 'photo', 'rating', 'is_verified']
        read_only_fields = ['id', 'rating']


class CaseListSerializer(serializers.ModelSerializer):
    """
    Сериализатор для списка заявок (краткая информация)
    """
    client_name = serializers.CharField(source='client.username', read_only=True)
    lawyer_name = serializers.CharField(source='lawyer.full_name', read_only=True, allow_null=True)
    service_title = serializers.CharField(source='service.title', read_only=True)

    class Meta:
        model = Case
        fields = ['id', 'title', 'status', 'created_at', 'client_name', 'lawyer_name', 'service_title']


class CaseDetailSerializer(serializers.ModelSerializer):
    """
    Сериализатор для детального просмотра заявки
    """
    client = serializers.SerializerMethodField()
    lawyer = serializers.SerializerMethodField()
    service = serializers.SerializerMethodField()
    review = serializers.SerializerMethodField()  # ← ДОБАВЛЕНО ДЛЯ ОТОБРАЖЕНИЯ ОТЗЫВА

    class Meta:
        model = Case
        fields = '__all__'

    def get_client(self, obj):
        """Получение данных клиента"""
        if obj.client:
            return {
                'id': obj.client.id,
                'username': obj.client.username,
                'first_name': obj.client.first_name,
                'last_name': obj.client.last_name,
                'email': obj.client.email,
            }
        return None

    def get_lawyer(self, obj):
        """Получение данных адвоката"""
        if obj.lawyer:
            return {
                'id': obj.lawyer.id,
                'user_id': obj.lawyer.user.id,
                'full_name': obj.lawyer.full_name,
                'specialization': obj.lawyer.specialization,
            }
        return None

    def get_service(self, obj):
        """Получение данных услуги"""
        if obj.service:
            return {
                'id': obj.service.id,
                'title': obj.service.title,
                'price': obj.service.price,
            }
        return None

    def get_review(self, obj):
        """Получение отзыва для заявки"""
        if hasattr(obj, 'review') and obj.review:
            return {
                'id': obj.review.id,
                'rating': obj.review.rating,
                'text': obj.review.text,
                'created_at': obj.review.created_at,
            }
        return None


class CaseCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Сериализатор для создания и обновления заявок!
    """

    class Meta:
        model = Case
        fields = ['title', 'description', 'service']

    def validate_title(self, value):
        if len(value) < 5:
            raise serializers.ValidationError("Заголовок должен содержать минимум 5 символов")
        return value

    def validate_description(self, value):
        if len(value) < 10:
            raise serializers.ValidationError("Описание должно содержать минимум 10 символов")
        return value


class ReviewSerializer(serializers.ModelSerializer):
    """
    Сериализатор для отзывов
    """

    class Meta:
        model = Review
        fields = ['id', 'rating', 'text', 'created_at']
        read_only_fields = ['id', 'created_at', 'client', 'lawyer', 'case']