from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from django.utils import timezone
from django.conf import settings
import requests
import json
from .models import SubscriptionPlan, Payment, UserSubscription
from .serializers import (
    SubscriptionPlanSerializer, PaymentSerializer,
    UserSubscriptionSerializer, CreatePaymentSerializer
)
from users.models import User

class SubscriptionPlanListView(generics.ListAPIView):
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        user_type = self.request.query_params.get('user_type', 'both')
        if user_type != 'both':
            return SubscriptionPlan.objects.filter(
                user_type__in=[user_type, 'both'],
                is_active=True
            )
        return SubscriptionPlan.objects.filter(is_active=True)

class CreatePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data)
        if serializer.is_valid():
            plan_id = serializer.validated_data['plan_id']
            payment_method = serializer.validated_data['payment_method']
            period = serializer.validated_data['period']
            
            try:
                plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
            except SubscriptionPlan.DoesNotExist:
                return Response(
                    {'error': 'Тарифный план не найден'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Определяем цену в зависимости от периода
            price = plan.price_yearly if period == 'yearly' else plan.price_monthly
            
            # Создаем запись о платеже
            payment = Payment.objects.create(
                user=request.user,
                subscription_plan=plan,
                amount=price,
                payment_method=payment_method,
                description=f"Подписка {plan.name} ({period})",
                metadata={
                    'period': period,
                    'plan_type': plan.plan_type,
                    'user_type': plan.user_type
                }
            )
            
            # Создаем платеж во внешней системе
            payment_url = self.create_external_payment(payment, request)
            
            return Response({
                'payment_id': payment.id,
                'payment_url': payment_url,
                'amount': float(payment.amount)
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def create_external_payment(self, payment, request):
        # Интеграция с ЮKassa
        if payment.payment_method == 'yookassa':
            return self.create_yookassa_payment(payment, request)
        # Интеграция с Т-Банком
        elif payment.payment_method == 'tbank':
            return self.create_tbank_payment(payment, request)
        # Для карт возвращаем URL для фронтенда
        else:
            return f"{settings.FRONTEND_URL}/payment/process/{payment.id}"

    def create_yookassa_payment(self, payment, request):
        # TODO: Реализовать интеграцию с ЮKassa
        yookassa_url = "https://api.yookassa.ru/v3/payments"
        
        payload = {
            "amount": {
                "value": str(payment.amount),
                "currency": "RUB"
            },
            "confirmation": {
                "type": "redirect",
                "return_url": f"{settings.FRONTEND_URL}/payment/success"
            },
            "description": payment.description,
            "metadata": {
                "payment_id": payment.id,
                "user_id": payment.user.id
            }
        }
        
        # headers = {
        #     "Authorization": f"Basic {settings.YOOKASSA_SHOP_ID}:{settings.YOOKASSA_SECRET_KEY}",
        #     "Idempotence-Key": str(payment.id)
        # }
        
        # response = requests.post(yookassa_url, json=payload, headers=headers)
        # data = response.json()
        
        # return data['confirmation']['confirmation_url']
        
        # Заглушка для демонстрации
        return f"{settings.FRONTEND_URL}/payment/demo/{payment.id}"

    def create_tbank_payment(self, payment, request):
        # TODO: Реализовать интеграцию с Т-Банком
        # Заглушка для демонстрации
        return f"{settings.FRONTEND_URL}/payment/demo/{payment.id}"

class PaymentCallbackView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        # Обработка callback от платежной системы
        payment_data = request.data
        
        # TODO: Реализовать проверку подписи и обработку разных платежных систем
        
        payment_id = payment_data.get('metadata', {}).get('payment_id')
        if not payment_id:
            return Response({'error': 'Payment ID not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Обновляем статус платежа
        payment.status = 'completed' if payment_data.get('status') == 'succeeded' else 'failed'
        payment.external_id = payment_data.get('id')
        payment.completed_at = timezone.now()
        payment.metadata['callback_data'] = payment_data
        payment.save()
        
        # Если платеж успешен, активируем подписку
        if payment.status == 'completed':
            self.activate_subscription(payment)
        
        return Response({'status': 'ok'})
    
    def activate_subscription(self, payment):
        user = payment.user
        plan = payment.subscription_plan
        period = payment.metadata.get('period', 'monthly')
        
        # Определяем длительность подписки
        if period == 'yearly':
            end_date = timezone.now() + timezone.timedelta(days=365)
        else:
            end_date = timezone.now() + timezone.timedelta(days=30)
        
        # Создаем или обновляем подписку пользователя
        subscription, created = UserSubscription.objects.get_or_create(
            user=user,
            defaults={
                'plan': plan,
                'start_date': timezone.now(),
                'end_date': end_date,
                'payment': payment,
                'features': plan.features
            }
        )
        
        if not created:
            subscription.plan = plan
            subscription.start_date = timezone.now()
            subscription.end_date = end_date
            subscription.payment = payment
            subscription.features = plan.features
            subscription.is_active = True
            subscription.save()

class UserSubscriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            subscription = UserSubscription.objects.get(user=request.user)
            serializer = UserSubscriptionSerializer(subscription)
            return Response(serializer.data)
        except UserSubscription.DoesNotExist:
            return Response({'detail': 'Подписка не найдена'}, status=status.HTTP_404_NOT_FOUND)

class PaymentHistoryView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user).order_by('-created_at')

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_subscription(request):
    try:
        subscription = UserSubscription.objects.get(user=request.user)
        subscription.is_active = False
        subscription.auto_renew = False
        subscription.save()
        
        return Response({'detail': 'Подписка отменена'})
    except UserSubscription.DoesNotExist:
        return Response(
            {'error': 'Подписка не найдена'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_subscription_features(request):
    try:
        subscription = UserSubscription.objects.get(user=request.user, is_active=True)
        
        if subscription.end_date < timezone.now():
            subscription.is_active = False
            subscription.save()
            return Response({
                'has_active_subscription': False,
                'features': {}
            })
        
        return Response({
            'has_active_subscription': True,
            'features': subscription.features
        })
    except UserSubscription.DoesNotExist:
        return Response({
            'has_active_subscription': False,
            'features': {}
        })