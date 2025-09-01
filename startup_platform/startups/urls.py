from django.urls import path
from .views import startups_list, startup_detail

urlpatterns = [
    path('', startups_list, name='startups-list'),
    path('<int:pk>/', startup_detail, name='startup-detail'),
]