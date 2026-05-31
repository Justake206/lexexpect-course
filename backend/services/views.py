"""
Представления для API приложения services
"""

from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import serializers
from django.db import models
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Service, Lawyer, Case, Review
from .serializers import (
    ServiceSerializer,
    LawyerSerializer,
    CaseListSerializer,
    CaseDetailSerializer,
    CaseCreateUpdateSerializer,
    ReviewSerializer
)
from .permissions import (
    IsAdminOrReadOnly,
    IsAuthorOrReadOnly,
    IsAssignedLawyerOrAdmin,
    IsCaseClientOrAdmin,
    CanAcceptCase
)


class ServiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet для работы с услугами (Service)
    """
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'title', 'created_at']


class LawyerViewSet(viewsets.ModelViewSet):
    """
    ViewSet для работы с адвокатами (Lawyer)!
    """
    queryset = Lawyer.objects.filter(is_verified=True)
    serializer_class = LawyerSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['specialization', 'user__first_name', 'user__last_name', 'user__username']
    ordering_fields = ['experience', 'rating']


class CaseViewSet(viewsets.ModelViewSet):
    """
    ViewSet для работы с заявками (Case)!
    """
    queryset = Case.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'status']

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Case.objects.none()

        if user.is_staff or user.user_type == 'admin':
            return Case.objects.all()

        if user.user_type == 'lawyer' and hasattr(user, 'lawyer_profile'):
            return Case.objects.filter(
                models.Q(lawyer=user.lawyer_profile) |
                models.Q(client=user) |
                models.Q(status='new')
            ).distinct()

        return Case.objects.filter(client=user)

    def get_serializer_class(self):
        if self.action == 'list':
            return CaseListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CaseCreateUpdateSerializer
        return CaseDetailSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsCaseClientOrAdmin()]
        elif self.action in ['update_status', 'assign_lawyer']:
            return [IsAssignedLawyerOrAdmin()]
        elif self.action in ['accept_case', 'reject_case']:
            return [CanAcceptCase()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def perform_create(self, serializer):
        case = serializer.save(client=self.request.user)
        self.notify_lawyers_about_new_case(case)

    def notify_lawyers_about_new_case(self, case):
        channel_layer = get_channel_layer()
        lawyers = Lawyer.objects.filter(is_verified=True)

        for lawyer in lawyers:
            if case.client == lawyer.user:
                continue
            try:
                async_to_sync(channel_layer.group_send)(
                    f"user_{lawyer.user.id}_notifications",
                    {
                        'type': 'new_case_available',
                        'case_id': case.id,
                        'title': case.title,
                        'message': f'📋 Новая заявка #{case.id}: {case.title}',
                    }
                )
            except Exception:
                pass

    @action(detail=True, methods=['post'])
    def accept_case(self, request, pk=None):
        case = self.get_object()
        user = request.user

        if case.status != 'new':
            return Response(
                {'error': 'Эту заявку уже обрабатывают'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if case.client == user:
            return Response(
                {'error': 'Вы не можете принять заявку, которую создали сами'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            lawyer = Lawyer.objects.get(user=user)
            case.lawyer = lawyer
            case.status = 'accepted'
            case.save()
        except Lawyer.DoesNotExist:
            return Response(
                {'error': 'Профиль адвоката не найден'},
                status=status.HTTP_400_BAD_REQUEST
            )

        channel_layer = get_channel_layer()
        try:
            async_to_sync(channel_layer.group_send)(
                f"user_{case.client.id}_notifications",
                {
                    'type': 'case_status_changed',
                    'case_id': case.id,
                    'new_status': 'accepted',
                    'message': f'✅ Ваша заявка #{case.id} принята адвокатом {lawyer.full_name}',
                }
            )
        except Exception:
            pass

        return Response({
            'success': True,
            'message': f'Заявка #{case.id} принята',
            'case_id': case.id,
            'lawyer_name': lawyer.full_name
        })

    @action(detail=True, methods=['post'])
    def reject_case(self, request, pk=None):
        case = self.get_object()
        user = request.user

        if case.status != 'new':
            return Response(
                {'error': 'Эту заявку уже обрабатывают'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if case.client == user:
            return Response(
                {'error': 'Вы не можете отклонить заявку, которую создали сами'},
                status=status.HTTP_400_BAD_REQUEST
            )

        case.status = 'rejected'
        case.save()

        return Response({
            'success': True,
            'message': f'Заявка #{case.id} отклонена'
        })

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        case = self.get_object()
        new_status = request.data.get('status')
        user = request.user

        if new_status not in dict(Case.STATUS_CHOICES):
            return Response(
                {'error': 'Неверный статус'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user.is_staff:
            case.status = new_status
            case.save()
            return Response({'status': case.status, 'message': 'Статус обновлён'})

        if user.user_type == 'lawyer' and case.lawyer and case.lawyer.user == user:
            case.status = new_status
            case.save()
            return Response({'status': case.status, 'message': 'Статус обновлён'})

        return Response(
            {'error': 'У вас нет прав для изменения статуса этой заявки'},
            status=status.HTTP_403_FORBIDDEN
        )

    @action(detail=True, methods=['post'])
    def assign_lawyer(self, request, pk=None):
        case = self.get_object()
        lawyer_id = request.data.get('lawyer_id')

        if not lawyer_id:
            return Response(
                {'error': 'Не указан ID адвоката'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            lawyer = Lawyer.objects.get(id=lawyer_id)
            case.lawyer = lawyer
            case.status = 'accepted'
            case.save()
            return Response({
                'message': f'Адвокат "{lawyer.full_name}" назначен на заявку #{case.id}',
                'case_id': case.id,
                'lawyer_name': lawyer.full_name
            })
        except Lawyer.DoesNotExist:
            return Response(
                {'error': f'Адвокат с ID {lawyer_id} не найден'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def my_cases(self, request):
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Требуется авторизация'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        cases = Case.objects.filter(client=request.user)
        serializer = CaseListSerializer(cases, many=True)
        return Response(serializer.data)


class ReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet для работы с отзывами (Review)
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthorOrReadOnly()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        """При создании отзыва"""
        case_id = self.request.data.get('case_id')

        if not case_id:
            raise serializers.ValidationError({"case_id": "Не указана заявка"})

        try:
            case = Case.objects.get(id=case_id)
        except Case.DoesNotExist:
            raise serializers.ValidationError({"case_id": "Заявка не найдена"})

        # Проверка: заявка должна быть завершена
        if case.status != 'completed':
            raise serializers.ValidationError({"status": "Отзыв можно оставить только после завершения заявки"})

        # Проверка: отзыв оставляет клиент, создавший заявку
        if case.client != self.request.user:
            raise serializers.ValidationError({"user": "Вы можете оставить отзыв только по своей заявке"})

        # Проверка: отзыв ещё не оставлен
        if hasattr(case, 'review'):
            raise serializers.ValidationError("Вы уже оставляли отзыв на эту заявку")

        # Сохраняем отзыв
        serializer.save(
            client=self.request.user,
            case=case,
            lawyer=case.lawyer
        )

    @action(detail=False, methods=['get'])
    def by_lawyer(self, request):
        lawyer_id = request.query_params.get('lawyer_id')

        if not lawyer_id:
            return Response(
                {'error': 'Не указан ID адвоката'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            lawyer = Lawyer.objects.get(id=lawyer_id)
            reviews = Review.objects.filter(lawyer=lawyer)
            serializer = self.get_serializer(reviews, many=True)
            return Response({
                'lawyer_id': lawyer.id,
                'lawyer_name': lawyer.full_name,
                'reviews_count': reviews.count(),
                'average_rating': sum(r.rating for r in reviews) / reviews.count() if reviews.exists() else 0,
                'reviews': serializer.data
            })
        except Lawyer.DoesNotExist:
            return Response(
                {'error': f'Адвокат с ID {lawyer_id} не найден'},
                status=status.HTTP_404_NOT_FOUND
            )