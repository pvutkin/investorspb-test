from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/startups/', include('startups.urls')),
    path('api/investors/', include('investors.urls')),
    path('api/messaging/', include('messaging.urls')),
    path('api/moderation/', include('moderation.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/industries/', include('startups.urls_industries')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)