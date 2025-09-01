"""URL Configuration"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/startups/', include('startups.urls')),
    path('api/investors/', include('investors.urls')),
    path('api/messaging/', include('messaging.urls')),
    path('api/moderation/', include('moderation.urls')),
    path('api/payments/', include('payments.urls')),
]