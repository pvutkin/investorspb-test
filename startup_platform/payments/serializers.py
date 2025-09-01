from rest_framework import serializers
from .models import SubscriptionPlan, Payment, UserSubscription
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
    payment_id = serializers.CharField(required=True)
    status = serializers.ChoiceField(choices=[
        'succeeded', 'canceled', 'waiting_for_capture'
    ])
    amount = serializers.DictField(required=False)
    metadata = serializers.DictField(required=False)