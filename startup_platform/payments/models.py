from django.db import models
from users.models import User

class SubscriptionPlan(models.Model):
    PLAN_TYPES = (
        ('basic', 'Basic'),
        ('pro', 'Pro'),
        ('enterprise', 'Enterprise'),
    )
    
    USER_TYPES = (
        ('startup', 'Стартап'),
        ('investor', 'Инвестор'),
        ('both', 'Оба'),
    )
    
    name = models.CharField(max_length=100)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES)
    user_type = models.CharField(max_length=10, choices=USER_TYPES)
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2)
    price_yearly = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    features = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    max_messages = models.IntegerField(null=True, blank=True)  # null = unlimited
    max_connections = models.IntegerField(null=True, blank=True)
    can_see_premium_profiles = models.BooleanField(default=False)
    advanced_search = models.BooleanField(default=False)
    priority_support = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'subscription_plans'
        verbose_name = 'Тарифный план'
        verbose_name_plural = 'Тарифные планы'

class Payment(models.Model):
    PAYMENT_STATUS = (
        ('pending', 'Ожидание'),
        ('completed', 'Завершено'),
        ('failed', 'Ошибка'),
        ('refunded', 'Возврат'),
    )
    
    PAYMENT_METHODS = (
        ('yookassa', 'ЮKassa'),
        ('tbank', 'Т-Банк'),
        ('card', 'Банковская карта'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    subscription_plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='RUB')
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    external_id = models.CharField(max_length=100, blank=True, null=True)  # ID from payment system
    description = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'payments'
        verbose_name = 'Платеж'
        verbose_name_plural = 'Платежи'
        ordering = ['-created_at']

class UserSubscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='current_subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    auto_renew = models.BooleanField(default=True)
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, blank=True)
    features = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_subscriptions'
        verbose_name = 'Подписка пользователя'
        verbose_name_plural = 'Подписки пользователей'