from django.urls import path
from .views import complaints_list, verifications_list

urlpatterns = [
    path('complaints/', complaints_list, name='complaints-list'),
    path('verifications/', verifications_list, name='verifications-list'),
]