from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserProfile, Subscription, Payment, Verification


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'user_type', 'is_verified']
    list_filter = ['user_type', 'is_verified']
    search_fields = ['username', 'email']
    fieldsets = UserAdmin.fieldsets + (
        ('Дополнительно', {'fields': ('user_type', 'phone', 'is_verified')}),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']
    search_fields = ['user__username']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'subscription_type', 'is_active', 'start_date', 'end_date']
    list_filter = ['subscription_type', 'is_active']
    search_fields = ['user__username']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount', 'payment_method', 'status', 'created_at']
    list_filter = ['payment_method', 'status', 'created_at']
    search_fields = ['transaction_id', 'user__username']


@admin.register(Verification)
class VerificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'verification_type', 'verified', 'verified_at']
    list_filter = ['verification_type', 'verified']
    search_fields = ['user__username']
