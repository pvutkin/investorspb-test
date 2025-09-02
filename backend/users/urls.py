from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('profile/', views.UserDetailView.as_view(), name='user-detail'),
    path('profile/update/', views.UpdateProfileView.as_view(), name='update-profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('verify-email/', views.VerifyEmailView.as_view(), name='verify-email'),
    path('verify-phone/', views.VerifyPhoneView.as_view(), name='verify-phone'),
    path('online-status/', views.UserOnlineStatusView.as_view(), name='online-status'),
    path('online-count/', views.online_users_count, name='online-count'),
]