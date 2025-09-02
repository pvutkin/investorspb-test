from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('conversations/create/', views.CreateConversationView.as_view(), name='conversation-create'),
    path('conversations/<int:pk>/', views.ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:conversation_id>/delete/', views.DeleteConversationView.as_view(), name='conversation-delete'),
    path('conversations/<int:conversation_id>/messages/', views.MessageListView.as_view(), name='message-list'),
    path('conversations/<int:conversation_id>/send/', views.SendMessageView.as_view(), name='send-message'),
    path('unread-count/', views.unread_messages_count, name='unread-count'),
]