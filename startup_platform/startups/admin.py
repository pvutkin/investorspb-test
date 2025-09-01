from django.contrib import admin
from .models import Startup, StartupTeam, StartupFinancials

@admin.register(Startup)
class StartupAdmin(admin.ModelAdmin):
    list_display = ['name', 'stage', 'industry', 'funding_requested', 'created_by', 'is_verified']
    list_filter = ['stage', 'industry', 'is_verified']
    search_fields = ['name', 'description']

@admin.register(StartupTeam)
class StartupTeamAdmin(admin.ModelAdmin):
    list_display = ['startup', 'member_name', 'role']
    list_filter = ['startup']

@admin.register(StartupFinancials)
class StartupFinancialsAdmin(admin.ModelAdmin):
    list_display = ['startup', 'revenue', 'expenses']