from django.urls import path
from .views import subscriptions_list, payments_list

urlpatterns = [
    path('subscriptions/', subscriptions_list, name='subscriptions-list'),
    path('payments/', payments_list, name='payments-list'),
]