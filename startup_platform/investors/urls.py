from django.urls import path
from .views import investors_list, investor_detail

urlpatterns = [
    path('', investors_list, name='investors-list'),
    path('<int:pk>/', investor_detail, name='investor-detail'),
]