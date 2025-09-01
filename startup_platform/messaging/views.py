from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from django.db.models import Q
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Conversation, Message, MessageAttachment
from .serializers import (
    ConversationListSerializer, ConversationDetailSerializer,
    MessageSerializer, SendMessageSerializer,
    CreateConversationSerializer
)
from users.models import User

class ConversationListView(generics.ListAPIView):
    serializer_class = ConversationListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user,
            is_active=True
        ).prefetch_related('participants')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user,
            is_active=True
        )
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Помечаем сообщения как прочитанные
        unread_messages = instance.messages.filter(
            is_read=False
        ).exclude(sender=request.user)
        
        unread_messages.update(is_read=True, read_at=timezone.now())
        
        # Обновляем счетчик непрочитанных
        instance.unread_count[str(request.user.id)] = 0
        instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class CreateConversationView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = CreateConversationSerializer(data=request.data)
        if serializer.is_valid():
            participant_id = serializer.validated_data['participant_id']
            
            try:
                participant = User.objects.get(id=participant_id)
            except User.DoesNotExist:
                return Response(
                    {'error': 'Пользователь не найден'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Проверяем, существует ли уже диалог
            existing_conversation = Conversation.objects.filter(
                participants=request.user
            ).filter(
                participants=participant
            ).first()
            
            if existing_conversation:
                return Response(
                    ConversationDetailSerializer(existing_conversation).data,
                    status=status.HTTP_200_OK
                )
            
            # Создаем новый диалог
            conversation = Conversation.objects.create()
            conversation.participants.add(request.user, participant)
            conversation.save()
            
            return Response(
                ConversationDetailSerializer(conversation).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SendMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(
                id=conversation_id,
                participants=request.user,
                is_active=True
            )
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Диалог не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = SendMessageSerializer(data=request.data)
        if serializer.is_valid():
            message_data = serializer.validated_data.copy()
            message_data['conversation'] = conversation
            message_data['sender'] = request.user
            
            message = Message.objects.create(**message_data)
            
            # Обновляем последнее сообщение в диалоге
            conversation.last_message = message.content
            conversation.last_message_time = message.timestamp
            conversation.updated_at = timezone.now()
            
            # Обновляем счетчики непрочитанных
            for participant in conversation.participants.exclude(id=request.user.id):
                participant_id = str(participant.id)
                conversation.unread_count[participant_id] = conversation.unread_count.get(participant_id, 0) + 1
            
            conversation.save()
            
            # Отправляем уведомление через WebSocket
            self.send_websocket_notification(conversation, message)
            
            return Response(
                MessageSerializer(message).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def send_websocket_notification(self, conversation, message):
        channel_layer = get_channel_layer()
        
        for participant in conversation.participants.exclude(id=message.sender.id):
            async_to_sync(channel_layer.group_send)(
                f"user_{participant.id}",
                {
                    'type': 'chat_message',
                    'message': MessageSerializer(message).data,
                    'conversation_id': conversation.id
                }
            )

class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        return Message.objects.filter(
            conversation_id=conversation_id,
            conversation__participants=self.request.user
        ).order_by('timestamp')
    
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        
        # Помечаем сообщения как прочитанные
        conversation_id = self.kwargs['conversation_id']
        unread_messages = Message.objects.filter(
            conversation_id=conversation_id,
            is_read=False
        ).exclude(sender=request.user)
        
        unread_messages.update(is_read=True, read_at=timezone.now())
        
        return response

class DeleteConversationView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(
                id=conversation_id,
                participants=request.user
            )
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Диалог не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        conversation.is_active = False
        conversation.save()
        
        return Response({'detail': 'Диалог удален'})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_messages_count(request):
    conversations = Conversation.objects.filter(
        participants=request.user,
        is_active=True
    )
    
    total_unread = 0
    for conversation in conversations:
        total_unread += conversation.unread_count.get(str(request.user.id), 0)
    
    return Response({'unread_count': total_unread})