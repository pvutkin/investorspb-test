from rest_framework import serializers
from .models import Conversation, Message, MessageAttachment
from users.serializers import UserSerializer

class MessageAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageAttachment
        fields = '__all__'
        read_only_fields = ('message', 'uploaded_at')

class MessageSerializer(serializers.ModelSerializer):
    sender_info = UserSerializer(source='sender', read_only=True)
    attachments = MessageAttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ('sender', 'conversation', 'timestamp', 'read_at')

class ConversationListSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ('id', 'other_user', 'last_message', 'unread_count', 
                 'updated_at', 'is_active')
    
    def get_other_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other_user = obj.get_other_participant(request.user)
            return UserSerializer(other_user, context=self.context).data
        return None
    
    def get_last_message(self, obj):
        last_message = obj.messages.last()
        if last_message:
            return {
                'content': last_message.content,
                'timestamp': last_message.timestamp,
                'sender_id': last_message.sender.id
            }
        return None
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.unread_count.get(str(request.user.id), 0)
        return 0

class ConversationDetailSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    other_user = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = '__all__'
    
    def get_other_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other_user = obj.get_other_participant(request.user)
            return UserSerializer(other_user, context=self.context).data
        return None

class CreateConversationSerializer(serializers.Serializer):
    participant_id = serializers.IntegerField(required=True)

class SendMessageSerializer(serializers.ModelSerializer):
    attachments = MessageAttachmentSerializer(many=True, required=False)
    
    class Meta:
        model = Message
        fields = ('content', 'message_type', 'attachments')
    
    def create(self, validated_data):
        attachments_data = validated_data.pop('attachments', [])
        message = Message.objects.create(**validated_data)
        
        for attachment_data in attachments_data:
            MessageAttachment.objects.create(message=message, **attachment_data)
        
        return message