"""
Сигналы для отправки уведомлений
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Case
from datetime import datetime


@receiver(post_save, sender=Case)
def case_status_changed(sender, instance, created, **kwargs):
    """Отправляем уведомление при изменении статуса заявки"""

    # Не отправляем при создании новой заявки
    if created:
        return

    channel_layer = get_channel_layer()

    # Уведомление для КЛИЕНТА
    try:
        async_to_sync(channel_layer.group_send)(
            f"user_{instance.client.id}_notifications",
            {
                'type': 'case_status_changed',
                'case_id': instance.id,
                'new_status': instance.status,
                'message': f'📌 Статус вашей заявки #{instance.id} изменён на "{instance.get_status_display()}"',
                'timestamp': datetime.now().isoformat(),
            }
        )
        print(f"Уведомление отправлено клиенту {instance.client.username}")
    except Exception as e:
        print(f"Ошибка отправки уведомления клиенту: {e}")

    # Уведомление для АДВОКАТА (если назначен)
    if instance.lawyer:
        try:
            async_to_sync(channel_layer.group_send)(
                f"user_{instance.lawyer.user.id}_notifications",
                {
                    'type': 'case_status_changed',
                    'case_id': instance.id,
                    'new_status': instance.status,
                    'message': f'📌 Статус заявки #{instance.id} изменён на "{instance.get_status_display()}"',
                    'timestamp': datetime.now().isoformat(),
                }
            )
            print(f"Уведомление отправлено адвокату {instance.lawyer.user.username}")
        except Exception as e:
            print(f"Ошибка отправки уведомления адвокату: {e}")