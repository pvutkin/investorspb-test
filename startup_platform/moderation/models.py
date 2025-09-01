from django.db import models
from users.models import User

class ModerationReport(models.Model):
    REPORT_TYPES = (
        ('spam', 'Спам'),
        ('fraud', 'Мошенничество'),
        ('inappropriate', 'Неуместный контент'),
        ('fake', 'Фейковый профиль'),
        ('other', 'Другое'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'На рассмотрении'),
        ('approved', 'Подтверждено'),
        ('rejected', 'Отклонено'),
        ('resolved', 'Решено'),
    )
    
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_made')
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_received')
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    description = models.TextField()
    evidence = models.FileField(upload_to='moderation_evidence/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    moderator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='moderated_reports')
    resolution = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'moderation_reports'
        verbose_name = 'Жалоба'
        verbose_name_plural = 'Жалобы'
        ordering = ['-created_at']

class UserBan(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ban')
    reason = models.TextField()
    duration_days = models.IntegerField(null=True, blank=True)  # null = permanent
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    moderator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='bans_given')
    
    class Meta:
        db_table = 'user_bans'
        verbose_name = 'Бан пользователя'
        verbose_name_plural = 'Баны пользователей'

class VerificationRequest(models.Model):
    VERIFICATION_TYPES = (
        ('basic', 'Базовая'),
        ('advanced', 'Расширенная'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'На рассмотрении'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_requests')
    verification_type = models.CharField(max_length=20, choices=VERIFICATION_TYPES)
    documents = models.JSONField(default=list)  # List of document URLs
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    moderator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_verifications')
    comments = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'verification_requests'
        verbose_name = 'Запрос верификации'
        verbose_name_plural = 'Запросы верификации'
        ordering = ['-created_at']