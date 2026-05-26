import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Получаем токен из query string
        query_string = self.scope['query_string'].decode()
        token = None
        
        for param in query_string.split('&'):
            if param.startswith('token='):
                token = param.split('=')[1]
                break
        
        if not token:
            await self.close()
            return
        
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            from django.contrib.auth import get_user_model
            
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            
            User = get_user_model()
            self.user = await self.get_user(User, user_id)
            
            if not self.user:
                await self.close()
                return
                
        except Exception as e:
            print(f"Auth error: {e}")
            await self.close()
            return
        
        self.group_name = f"user_{self.user.id}_notifications"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
        
        await self.send(text_data=json.dumps({
            'type': 'connected',
            'message': f'Добро пожаловать, {self.user.username}!'
        }))

    @database_sync_to_async
    def get_user(self, User, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def case_status_changed(self, event):
        """Уведомление об изменении статуса заявки"""
        await self.send(text_data=json.dumps({
            'type': 'case_status_changed',
            'case_id': event.get('case_id'),
            'new_status': event.get('new_status'),
            'message': event.get('message', 'Статус заявки изменён'),
            'timestamp': event.get('timestamp'),
        }))

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'title': event.get('title', 'Уведомление'),
            'message': event.get('message', ''),
            'case_id': event.get('case_id'),
        }))