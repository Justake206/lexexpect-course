"""
Маршруты API для приложения services
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'services', views.ServiceViewSet)   # /api/services/
router.register(r'lawyers', views.LawyerViewSet)     # /api/lawyers/
router.register(r'cases', views.CaseViewSet)         # /api/cases/
router.register(r'reviews', views.ReviewViewSet)     # /api/reviews/

urlpatterns = [
    path('', include(router.urls)),
]