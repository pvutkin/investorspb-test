import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import Conversation, Message
from users.models import UserActivity

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        
        if self.user.is_anonymous:
            await self.close()
            return
        
        # Join user group
        await self.channel_layer.group_add(
            f"user_{self.user.id}",
            self.channel_name
        )
        
        # Update user online status
        await self.update_user_online_status(True)
        
        await self.accept()

    async def disconnect(self, close_code):
        if not self.user.is_anonymous:
            # Remove from user group
            await self.channel_layer.group_discard(
                f"user_{self.user.id}",
                self.channel_name
            )
            
            # Update user online status
            await self.update_user_online_status(False)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'typing':
                await self.handle_typing(data)
            elif message_type == 'read_receipt':
                await self.handle_read_receipt(data)
                
        except json.JSONDecodeError:
            pass

    async def handle_chat_message(self, data):
        conversation_id = data.get('conversation_id')
        content = data.get('content')
        
        if conversation_id and content:
            # Save message to database
            message = await self.save_message(conversation_id, content)
            
            # Send to other participants
            await self.channel_layer.group_send(
                f"conversation_{conversation_id}",
                {
                    'type': 'chat_message',
                    'message': await self.serialize_message(message)
                }
            )

    async def handle_typing(self, data):
        conversation_id = data.get('conversation_id')
        is_typing = data.get('is_typing')
        
        if conversation_id:
            await self.channel_layer.group_send(
                f"conversation_{conversation_id}",
                {
                    'type': 'typing_indicator',
                    'user_id': self.user.id,
                    'is_typing': is_typing
                }
            )

    async def handle_read_receipt(self, data):
        message_id = data.get('message_id')
        if message_id:
            await self.mark_message_as_read(message_id)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))

    async def typing_indicator(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user_id': event['user_id'],
            'is_typing': event['is_typing']
        }))

    @database_sync_to_async
    def save_message(self, conversation_id, content):
        conversation = Conversation.objects.get(id=conversation_id)
        message = Message.objects.create(
            conversation=conversation,
            sender=self.user,
            content=content
        )
        
        # Update conversation
        conversation.last_message = content
        conversation.last_message_time = message.timestamp
        conversation.save()
        
        return message

    @database_sync_to_async
    def serialize_message(self, message):
        from .serializers import MessageSerializer
        return MessageSerializer(message).data

    @database_sync_to_async
    def mark_message_as_read(self, message_id):
        try:
            message = Message.objects.get(id=message_id)
            if message.sender != self.user:
                message.is_read = True
                message.save()
        except Message.DoesNotExist:
            pass

    @database_sync_to_async
    def update_user_online_status(self, is_online):
        activity, created = UserActivity.objects.get_or_create(user=self.user)
        activity.is_online = is_online
        activity.save()