from django.urls import path
from . import views

urlpatterns = [
    path('', views.StartupListView.as_view(), name='startup-list'),
    path('my/', views.UserStartupsView.as_view(), name='user-startups'),
    path('create/', views.StartupCreateView.as_view(), name='startup-create'),
    path('<int:pk>/', views.StartupDetailView.as_view(), name='startup-detail'),
    path('<int:pk>/update/', views.StartupUpdateView.as_view(), name='startup-update'),
    path('<int:pk>/delete/', views.StartupDeleteView.as_view(), name='startup-delete'),
    path('<int:startup_id>/reviews/', views.StartupReviewCreateView.as_view(), name='startup-review-create'),
    path('stats/', views.startup_stats, name='startup-stats'),
]