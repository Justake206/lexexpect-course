# LexExpect - Юридическая платформа

## 📋 О проекте
LexExpect - это веб-приложение для юридических консультаций, позволяющее клиентам находить адвокатов и записываться на консультации.

## Технологии
- **Backend**: Django 4.2 + Django REST Framework
- **Frontend**: React 18 + Bootstrap 5
- **База данных**: SQLite
- **Аутентификация**: JWT токены

## 📁 Структура проекта
lexexpect/
├── backend/ # Django backend
│ └── services/ # Основное приложение
├── frontend/ # React frontend
│ └── src/
│ ├── components/ # React компоненты
│ └── context/ # Контексты (Auth)
├── media/ # Загруженные файлы
├── venv/ # Виртуальное окружение
├── manage.py # Django менеджер
└── requirements.txt # Зависимости Python
## 🔧 Установка и запуск

### Предварительные требования
- Python 3.9+
- Node.js 18+
- Git

### Быстрый старт

1. **Клонировать репозиторий**
   `ash
   git clone <url>
   cd lexexpect
Настроить backend

bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
Настроить frontend

bash
cd frontend
npm install
npm start
Открыть в браузере

Frontend: http://localhost:3000

Backend API: http://127.0.0.1:8000/api/

Admin panel: http://127.0.0.1:8000/admin

Доступные скрипты
Backend
activate.bat - активация виртуального окружения

python manage.py runserver - запуск сервера

python manage.py makemigrations - создание миграций

python manage.py migrate - применение миграций

Frontend
npm start - запуск в режиме разработки

npm run build - сборка для продакшена

Основные функции
Регистрация и авторизация пользователей

Просмотр списка адвокатов

Просмотр услуг

Создание заявок на консультацию

