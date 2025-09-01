from django.contrib import admin
from .models import Complaint, Verification

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ['reporter', 'complaint_type', 'target_startup', 'target_investor', 'created_at', 'resolved']
    list_filter = ['complaint_type', 'resolved', 'created_at']

@admin.register(Verification)
class VerificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'verification_type', 'verified', 'verified_at']
    list_filter = ['verified', 'verification_type']