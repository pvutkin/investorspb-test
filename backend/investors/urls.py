from django.urls import path
from . import views

urlpatterns = [
    path('', views.InvestorListView.as_view(), name='investor-list'),
    path('my/', views.UserInvestorsView.as_view(), name='user-investors'),
    path('create/', views.InvestorCreateView.as_view(), name='investor-create'),
    path('<int:pk>/', views.InvestorDetailView.as_view(), name='investor-detail'),
    path('<int:pk>/update/', views.InvestorUpdateView.as_view(), name='investor-update'),
    path('<int:pk>/delete/', views.InvestorDeleteView.as_view(), name='investor-delete'),
    path('<int:investor_id>/reviews/', views.InvestorReviewCreateView.as_view(), name='investor-review-create'),
    path('portfolio/', views.PortfolioItemCreateView.as_view(), name='portfolio-create'),
    path('portfolio/<int:pk>/', views.PortfolioItemUpdateView.as_view(), name='portfolio-update'),
    path('portfolio/<int:pk>/delete/', views.PortfolioItemDeleteView.as_view(), name='portfolio-delete'),
    path('stats/', views.investor_stats, name='investor-stats'),
]