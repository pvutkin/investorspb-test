from django.contrib import admin
from .models import Investor, InvestorPortfolio


@admin.register(Investor)
class InvestorAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_by', 'investor_type', 'is_verified']
    list_filter = ['investor_type', 'is_verified']
    search_fields = ['name', 'created_by__username']


@admin.register(InvestorPortfolio)
class InvestorPortfolioAdmin(admin.ModelAdmin):
    list_display = ['investor', 'company_name', 'investment_amount', 'investment_date']
    list_filter = ['investment_date']
    search_fields = ['investor__name', 'company_name']
