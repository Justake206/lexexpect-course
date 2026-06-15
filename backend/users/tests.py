"""
Модульные тесты для приложения users
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse

User = get_user_model()


class UserModelTest(TestCase):
    """Тесты для модели User"""

    def setUp(self):
        self.client_user = User.objects.create_user(
            username="client_test",
            email="client@test.com",
            password="clientpass123",
            user_type="client",
            first_name="Иван",
            last_name="Клиентов"
        )
        self.lawyer_user = User.objects.create_user(
            username="lawyer_test",
            email="lawyer@test.com",
            password="lawyerpass123",
            user_type="lawyer",
            first_name="Петр",
            last_name="Адвокатов"
        )

    def test_user_creation_client(self):
        """Тест 1: Создание пользователя-клиента"""
        self.assertEqual(self.client_user.username, "client_test")
        self.assertEqual(self.client_user.user_type, "client")

    def test_user_creation_lawyer(self):
        """Тест 2: Создание пользователя-адвоката"""
        self.assertEqual(self.lawyer_user.username, "lawyer_test")
        self.assertEqual(self.lawyer_user.user_type, "lawyer")

    def test_user_is_client_property(self):
        """Тест 3: Свойство is_client"""
        self.assertTrue(self.client_user.is_client)
        self.assertFalse(self.client_user.is_lawyer)

    def test_user_is_lawyer_property(self):
        """Тест 4: Свойство is_lawyer"""
        self.assertTrue(self.lawyer_user.is_lawyer)
        self.assertFalse(self.lawyer_user.is_client)

    def test_user_str_method(self):
        """Тест 5: Строковое представление пользователя"""
        self.assertEqual(str(self.client_user), "client_test")

    def test_user_creation_without_email(self):
        """Тест 6: Создание пользователя без email"""
        user = User.objects.create_user(
            username="noemailuser",
            password="pass123",
            user_type="client"
        )
        self.assertEqual(user.email, "")

    def test_user_creation_duplicate_username(self):
        """Тест 7: Проверка уникальности username"""
        with self.assertRaises(Exception):
            User.objects.create_user(
                username="client_test",
                password="anotherpass",
                user_type="client"
            )