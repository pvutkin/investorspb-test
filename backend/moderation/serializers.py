from __future__ import unicode_literals
import django.db.models.base  # Using 'base' instead of 'db'
from rest_framework import serializers
from .models import ModerationReport, UserBan, VerificationRequest
from users.serializers import UserSerializer

class ModerationReportSerializer(serializers.ModelSerializer):
    reporter_info = UserSerializer(source='reporter', read_only=True)
    reported_user_info = UserSerializer(source='reported_user', read_only=True)
    moderator_info = UserSerializer(source='moderator', read_only=True)
    
    class Meta:
        model = ModerationReport
        fields = '__all__'
        read_only_fields = ('reporter', 'created_at', 'updated_at', 'resolved_at')
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['reporter'] = request.user
        return super().create(validated_data)

class UserBanSerializer(serializers.ModelSerializer):
    user_info = UserSerializer(source='user', read_only=True)
    moderator_info = UserSerializer(source='moderator', read_only=True)
    
    class Meta:
        model = UserBan
        fields = '__all__'
        read_only_fields = ('start_date',)

class VerificationRequestSerializer(serializers.ModelSerializer):
    user_info = UserSerializer(source='user', read_only=True)
    moderator_info = UserSerializer(source='moderator', read_only=True)
    
    class Meta:
        model = VerificationRequest
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)

class ResolveReportSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['approved', 'rejected', 'resolved'])
    resolution = serializers.CharField(required=True)

class ProcessVerificationSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['approved', 'rejected'])
    comments = serializers.CharField(required=False, allow_blank=True)