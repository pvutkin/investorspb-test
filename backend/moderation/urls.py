from django.urls import path
from . import views

urlpatterns = [
    path('reports/', views.ModerationReportListView.as_view(), name='report-list'),
    path('reports/create/', views.ModerationReportCreateView.as_view(), name='report-create'),
    path('reports/<int:report_id>/resolve/', views.ResolveReportView.as_view(), name='report-resolve'),
    path('verifications/', views.VerificationRequestListView.as_view(), name='verification-list'),
    path('verifications/create/', views.VerificationRequestCreateView.as_view(), name='verification-create'),
    path('verifications/<int:request_id>/process/', views.ProcessVerificationView.as_view(), name='verification-process'),
    path('bans/', views.UserBanListView.as_view(), name='ban-list'),
    path('bans/<int:user_id>/unban/', views.UnbanUserView.as_view(), name='user-unban'),
    path('stats/', views.moderation_stats, name='moderation-stats'),
]