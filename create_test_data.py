#!/usr/bin/env python
import os
import django
import sys

# Настройка Django окружения
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from backend.services.models import Service, Lawyer, Profile

def create_test_data():
    """Создание тестовых данных"""
    print("🚀 Начало создания тестовых данных...")
    
    # Создание услуг
    services_data = [
        {'title': 'Консультация юриста', 'description': 'Устная консультация по юридическим вопросам (30 минут)', 'price': 2000},
        {'title': 'Составление договора', 'description': 'Разработка и составление договоров любой сложности', 'price': 5000},
        {'title': 'Представительство в суде', 'description': 'Ведение дела в суде первой инстанции', 'price': 15000},
        {'title': 'Апелляционная жалоба', 'description': 'Составление и подача апелляционной жалобы', 'price': 8000},
        {'title': 'Регистрация ООО', 'description': 'Регистрация юридического лица под ключ', 'price': 12000},
        {'title': 'Недвижимость', 'description': 'Сопровождение сделок с недвижимостью', 'price': 25000},
    ]
    
    for service_data in services_data:
        service, created = Service.objects.get_or_create(
            title=service_data['title'],
            defaults={
                'description': service_data['description'],
                'price': service_data['price']
            }
        )
        if created:
            print(f"✅ Создана услуга: {service.title}")
        else:
            print(f"ℹ️ Услуга уже существует: {service.title}")
    
    # Создание адвокатов
    lawyers_data = [
        {
            'username': 'ivanov',
            'first_name': 'Иван',
            'last_name': 'Иванов',
            'email': 'ivanov@lexexpect.ru',
            'specialization': 'Гражданское право',
            'experience': 5,
            'bio': 'Опытный юрист по гражданским делам. Специализируется на спорах с застройщиками.'
        },
        {
            'username': 'petrova',
            'first_name': 'Елена',
            'last_name': 'Петрова',
            'email': 'petrova@lexexpect.ru',
            'specialization': 'Уголовное право',
            'experience': 8,
            'bio': 'Адвокат по уголовным делам. Более 50 успешных дел.'
        },
        {
            'username': 'sidorov',
            'first_name': 'Алексей',
            'last_name': 'Сидоров',
            'email': 'sidorov@lexexpect.ru',
            'specialization': 'Корпоративное право',
            'experience': 6,
            'bio': 'Специалист по корпоративным спорам и регистрации бизнеса.'
        },
    ]
    
    for lawyer_data in lawyers_data:
        # Создаем пользователя
        user, created = User.objects.get_or_create(
            username=lawyer_data['username'],
            defaults={
                'first_name': lawyer_data['first_name'],
                'last_name': lawyer_data['last_name'],
                'email': lawyer_data['email'],
                'is_staff': True
            }
        )
        
        if created:
            user.set_password('lawyer123')
            user.save()
            print(f"✅ Создан пользователь: {user.username}")
            
            # Обновляем профиль
            profile = user.profile
            profile.user_type = 'lawyer'
            profile.save()
            
            # Создаем адвоката
            Lawyer.objects.create(
                user=user,
                specialization=lawyer_data['specialization'],
                bio=lawyer_data['bio'],
                experience=lawyer_data['experience']
            )
            print(f"✅ Создан адвокат: {user.get_full_name()}")
        else:
            print(f"ℹ️ Пользователь уже существует: {user.username}")
    
    print("\n" + "="*50)
    print("✅ Создание тестовых данных завершено!")
    print("="*50)
    print(f"📊 Итого создано:")
    print(f"   - Услуг: {Service.objects.count()}")
    print(f"   - Адвокатов: {Lawyer.objects.count()}")
    print(f"   - Пользователей: {User.objects.count()}")
    print("="*50)

if __name__ == '__main__':
    create_test_data()
