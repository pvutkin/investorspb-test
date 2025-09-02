from rest_framework import serializers
from .models import SubscriptionPlan, Payment
from users.models import UserSubscription
from users.serializers import UserSerializer

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    user_info = UserSerializer(source='user', read_only=True)
    plan_info = SubscriptionPlanSerializer(source='subscription_plan', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('user', 'status', 'external_id', 'created_at', 
                          'updated_at', 'completed_at')

class UserSubscriptionSerializer(serializers.ModelSerializer):
    user_info = UserSerializer(source='user', read_only=True)
    plan_info = SubscriptionPlanSerializer(source='plan', read_only=True)
    payment_info = PaymentSerializer(source='payment', read_only=True)
    
    class Meta:
        model = UserSubscription
        fields = '__all__'
        read_only_fields = ('user', 'start_date', 'end_date', 'created_at', 'updated_at')

class CreatePaymentSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField(required=True)
    payment_method = serializers.ChoiceField(choices=[
        ('yookassa', 'ЮKassa'),
        ('tbank', 'Т-Банк'),
        ('card', 'Банковская карта')
    ])
    period = serializers.ChoiceField(choices=[('monthly', 'Месяц'), ('yearly', 'Год')])

class PaymentCallbackSerializer(serializers.Serializer):
    object = serializers.DictField(required=False)
    event = serializers.CharField(required=False)
    type = serializers.CharField(required=False)
    payment_id = serializers.CharField(required=False)
    status = serializers.ChoiceField(choices=[
        'succeeded', 'canceled', 'waiting_for_capture', 'pending', 'completed', 'failed'
    ], required=False)
    amount = serializers.DictField(required=False)
    metadata = serializers.DictField(required=False)
    id = serializers.CharField(required=False)  # ID из платежной системы
    
    def validate(self, data):
        # Проверяем наличие хотя бы одного из идентификаторов
        if not any(key in data for key in ['payment_id', 'id', 'object']):
            raise serializers.ValidationError("Payment identifier not found in callback data")
        return data