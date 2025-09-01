from django.contrib import admin
from .models import Investor, InvestorPortfolio

@admin.register(Investor)
class InvestorAdmin(admin.ModelAdmin):
    list_display = ['name', 'investor_type', 'min_investment_amount', 'max_investment_amount', 'created_by', 'is_verified']
    list_filter = ['investor_type', 'is_verified']
    search_fields = ['name', 'preferred_industries']

@admin.register(InvestorPortfolio)
class InvestorPortfolioAdmin(admin.ModelAdmin):
    list_display = ['investor', 'company_name', 'investment_amount', 'investment_date']
    list_filter = ['investor']