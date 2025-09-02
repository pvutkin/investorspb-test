from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    USER_TYPES = [
        ('startup', 'Startup'),
        ('investor', 'Investor'),
    ]
    user_type = models.CharField(max_length=20, choices=USER_TYPES)
    phone = models.CharField(max_length=15, blank=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.username


class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile of {self.user.username}"


class Subscription(models.Model):
    SUBSCRIPTION_TYPES = [
        ('basic', 'Basic'),
        ('pro', 'Pro'),
    ]
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    subscription_type = models.CharField(max_length=20, choices=SUBSCRIPTION_TYPES)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.subscription_type}"


class Payment(models.Model):
    PAYMENT_METHODS = [
        ('yoomoney', 'YooMoney'),
        ('tbank', 'T-Bank'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    ]
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    transaction_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.amount} ({self.status})"


class Verification(models.Model):
    VERIFICATION_TYPES = [
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('government', 'Government ID'),
    ]
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    verification_type = models.CharField(max_length=20, choices=VERIFICATION_TYPES)
    verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.verification_type}"
