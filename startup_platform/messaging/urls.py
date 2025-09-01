from django.urls import path
from .views import messages_list, conversations_list

urlpatterns = [
    path('messages/', messages_list, name='messages-list'),
    path('conversations/', conversations_list, name='conversations-list'),
]