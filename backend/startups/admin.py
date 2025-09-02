from django.contrib import admin
from .models import Startup, StartupTeam, StartupFinancials


@admin.register(Startup)
class StartupAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_by', 'stage', 'industry', 'funding_requested', 'is_verified']
    list_filter = ['stage', 'industry', 'is_verified']
    search_fields = ['name', 'created_by__username', 'description']


@admin.register(StartupTeam)
class StartupTeamAdmin(admin.ModelAdmin):
    list_display = ['member_name', 'startup', 'role', 'experience_years']
    list_filter = ['role']
    search_fields = ['member_name', 'startup__name']


@admin.register(StartupFinancials)
class StartupFinancialsAdmin(admin.ModelAdmin):
    list_display = ['startup', 'revenue', 'expenses', 'cash_flow']
