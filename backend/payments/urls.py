from django.urls import path
from . import views

urlpatterns = [
    path('plans/', views.SubscriptionPlanListView.as_view(), name='plan-list'),
    path('create/', views.CreatePaymentView.as_view(), name='payment-create'),
    path('callback/', views.PaymentCallbackView.as_view(), name='payment-callback'),
    path('history/', views.PaymentHistoryView.as_view(), name='payment-history'),
    path('subscription/', views.UserSubscriptionView.as_view(), name='user-subscription'),
    path('subscription/cancel/', views.cancel_subscription, name='cancel-subscription'),
    path('subscription/features/', views.check_subscription_features, name='check-features'),
]