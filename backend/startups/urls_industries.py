from django.urls import path
from . import views

urlpatterns = [
    path('', views.IndustryListView.as_view(), name='industry-list'),
]