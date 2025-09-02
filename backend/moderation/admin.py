from django.contrib import admin
from .models import Complaint


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ['reporter', 'complaint_type', 'resolved', 'created_at']
    list_filter = ['complaint_type', 'resolved', 'created_at']
    search_fields = ['reporter__username', 'description']
