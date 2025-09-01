from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    USER_TYPES = (
        ('startup', 'Стартап'),
        ('investor', 'Инвестор'),
        ('moderator', 'Модератор'),
    )
    
    VERIFICATION_LEVELS = (
        ('basic', 'Базовая'),
        ('advanced', 'Расширенная'),
        ('verified', 'Верифицирован'),
    )
    
    user_type = models.CharField(max_length=10, choices=USER_TYPES)
    phone = models.CharField(max_length=15, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    verification_level = models.CharField(
        max_length=20,
        choices=VERIFICATION_LEVELS,
        default='basic'
    )
    telegram_id = models.CharField(max_length=100, blank=True, null=True)
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    experience = models.TextField(blank=True, null=True)
    skills = models.JSONField(default=list, blank=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'Профиль пользователя'
        verbose_name_plural = 'Профили пользователей'

class UserActivity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    last_activity = models.DateTimeField(auto_now=True)
    is_online = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'user_activities'
        verbose_name = 'Активность пользователя'
        verbose_name_plural = 'Активности пользователей'

class UserSubscription(models.Model):
    SUBSCRIPTION_TYPES = (
        ('basic', 'Basic'),
        ('pro', 'Pro'),
        ('enterprise', 'Enterprise'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    subscription_type = models.CharField(max_length=20, choices=SUBSCRIPTION_TYPES, default='basic')
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    features = models.JSONField(default=dict)
    
    class Meta:
        db_table = 'user_subscriptions'
        verbose_name = 'Подписка пользователя'
        verbose_name_plural = 'Подписки пользователей'