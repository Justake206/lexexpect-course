"""
Модульные тесты для приложения services
Соответствуют требованиям методички (стр. 59, п. 3.4)
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Service, Lawyer, Case, Review, Favorite

User = get_user_model()


# ========== ТЕСТЫ МОДЕЛЕЙ (МОДУЛЬНОЕ ТЕСТИРОВАНИЕ) ==========

class ServiceModelTest(TestCase):
    """Тесты для модели Service (Услуги)"""

    def setUp(self):
        self.service = Service.objects.create(
            title="Консультация юриста",
            slug="konsultatsiya-yurista",
            description="Профессиональная консультация",
            price=2000.00,
            is_active=True
        )

    def test_service_creation(self):
        """Тест 1: Создание услуги"""
        self.assertEqual(self.service.title, "Консультация юриста")
        self.assertEqual(self.service.price, 2000.00)
        self.assertTrue(self.service.is_active)

    def test_service_str_method(self):
        """Тест 2: Строковое представление услуги"""
        self.assertEqual(str(self.service), "Консультация юриста")

    def test_service_slug_auto_generation(self):
        """Тест 3: Автоматическая генерация slug"""
        service2 = Service.objects.create(
            title="Составление договора",
            description="Составление договоров",
            price=5000.00
        )
        self.assertEqual(service2.slug, "sostavlenie-dogovora")


class LawyerModelTest(TestCase):
    """Тесты для модели Lawyer (Адвокаты)"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="lawyer1",
            password="lawyerpass123",
            user_type="lawyer",
            first_name="Иван",
            last_name="Петров"
        )
        self.lawyer = Lawyer.objects.create(
            user=self.user,
            specialization="Гражданское право",
            experience=5,
            bio="Опытный юрист",
            rating=4.5,
            is_verified=True
        )

    def test_lawyer_creation(self):
        """Тест 4: Создание адвоката"""
        self.assertEqual(self.lawyer.specialization, "Гражданское право")
        self.assertEqual(self.lawyer.experience, 5)
        self.assertEqual(self.lawyer.rating, 4.5)

    def test_lawyer_full_name_property(self):
        """Тест 5: Свойство full_name"""
        self.assertEqual(self.lawyer.full_name, "Иван Петров")

    def test_lawyer_str_method(self):
        """Тест 6: Строковое представление адвоката"""
        self.assertEqual(str(self.lawyer), "Иван Петров")


class CaseModelTest(TestCase):
    """Тесты для модели Case (Заявки)"""

    def setUp(self):
        self.client_user = User.objects.create_user(
            username="client1",
            password="clientpass123",
            user_type="client"
        )
        self.service = Service.objects.create(
            title="Консультация",
            slug="konsultatsiya",
            description="Консультация юриста",
            price=2000.00
        )
        self.case = Case.objects.create(
            client=self.client_user,
            service=self.service,
            title="Проблема с договором",
            description="Нужна помощь в составлении договора",
            status="new"
        )

    def test_case_creation(self):
        """Тест 7: Создание заявки"""
        self.assertEqual(self.case.title, "Проблема с договором")
        self.assertEqual(self.case.status, "new")
        self.assertEqual(self.case.client.username, "client1")

    def test_case_status_update(self):
        """Тест 8: Обновление статуса заявки"""
        self.case.status = "in_progress"
        self.case.save()
        self.assertEqual(self.case.status, "in_progress")

    def test_case_str_method(self):
        """Тест 9: Строковое представление заявки"""
        self.assertEqual(str(self.case), f"Заявка #{self.case.id} - Проблема с договором")


class ReviewModelTest(TestCase):
    """Тесты для модели Review (Отзывы)"""

    def setUp(self):
        self.client_user = User.objects.create_user(
            username="reviewclient",
            password="client123",
            user_type="client"
        )
        self.lawyer_user = User.objects.create_user(
            username="reviewlawyer",
            password="lawyer123",
            user_type="lawyer"
        )
        self.lawyer = Lawyer.objects.create(
            user=self.lawyer_user,
            specialization="Уголовное право",
            experience=8,
            bio="Опытный адвокат"
        )
        self.service = Service.objects.create(
            title="Услуга",
            slug="usluga",
            description="Описание",
            price=3000.00
        )
        self.case = Case.objects.create(
            client=self.client_user,
            service=self.service,
            title="Заявка для отзыва",
            description="Описание",
            status="completed"
        )
        self.review = Review.objects.create(
            case=self.case,
            client=self.client_user,
            lawyer=self.lawyer,
            rating=5,
            text="Отличная работа!"
        )

    def test_review_creation(self):
        """Тест 10: Создание отзыва"""
        self.assertEqual(self.review.rating, 5)
        self.assertEqual(self.review.text, "Отличная работа!")

    def test_review_one_to_one_case(self):
        """Тест 11: Связь один-к-одному с заявкой"""
        self.assertEqual(self.review.case.title, "Заявка для отзыва")

    def test_review_str_method(self):
        """Тест 12: Строковое представление отзыва"""
        self.assertIn("Отзыв от", str(self.review))


class FavoriteModelTest(TestCase):
    """Тесты для модели Favorite (Избранное)"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="favuser",
            password="favpass123",
            user_type="client"
        )
        self.lawyer_user = User.objects.create_user(
            username="favlawyer",
            password="lawyer123",
            user_type="lawyer"
        )
        self.lawyer = Lawyer.objects.create(
            user=self.lawyer_user,
            specialization="Гражданское право",
            experience=5,
            bio="Опытный юрист"
        )
        self.favorite = Favorite.objects.create(
            user=self.user,
            lawyer=self.lawyer
        )

    def test_favorite_creation(self):
        """Тест 13: Добавление адвоката в избранное"""
        self.assertEqual(self.favorite.user.username, "favuser")
        self.assertEqual(self.favorite.lawyer.full_name, self.lawyer.full_name)

    def test_favorite_unique_together(self):
        """Тест 14: Уникальность пары (user, lawyer)"""
        with self.assertRaises(Exception):
            Favorite.objects.create(user=self.user, lawyer=self.lawyer)


# ========== ТЕСТЫ API (ИНТЕГРАЦИОННОЕ ТЕСТИРОВАНИЕ) ==========

class APITestCase(APITestCase):
    """Тесты API (интеграционное тестирование)"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123",
            user_type="client"
        )
        self.service = Service.objects.create(
            title="Тестовая услуга",
            slug="test-service",
            description="Описание",
            price=1000.00
        )

    def test_register_api(self):
        """Тест 15: API регистрации пользователя"""
        url = reverse('register')
        data = {
            'username': 'newuser',
            'email': 'new@test.com',
            'password': 'newpass123',
            'password2': 'newpass123',
            'user_type': 'client'
        }
        response = self.client.post('/api/auth/register/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_login_api(self):
        """Тест 16: API входа в систему"""
        url = reverse('token_obtain_pair')
        data = {'username': 'testuser', 'password': 'testpass123'}
        response = self.client.post('/api/auth/login/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_services_list_api(self):
        """Тест 17: API получения списка услуг"""
        response = self.client.get('/api/services/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_case_api_unauthorized(self):
        """Тест 18: API создания заявки без авторизации"""
        url = '/api/cases/'
        data = {
            'title': 'Тестовая заявка',
            'description': 'Описание проблемы',
            'service': self.service.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_case_api_authorized(self):
        """Тест 19: API создания заявки с авторизацией"""
        self.client.force_authenticate(user=self.user)
        url = '/api/cases/'
        data = {
            'title': 'Тестовая заявка',
            'description': 'Описание проблемы',
            'service': self.service.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Case.objects.count(), 1)