from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from django.db.models import Count, Q
from django.utils import timezone
from .models import ModerationReport, UserBan, VerificationRequest
from .serializers import (
    ModerationReportSerializer, UserBanSerializer,
    VerificationRequestSerializer, ResolveReportSerializer,
    ProcessVerificationSerializer
)
from users.models import User

class ModerationReportCreateView(generics.CreateAPIView):
    serializer_class = ModerationReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

class ModerationReportListView(generics.ListAPIView):
    serializer_class = ModerationReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'moderator':
            return ModerationReport.objects.all().order_by('-created_at')
        
        # Обычные пользователи видят только свои жалобы
        return ModerationReport.objects.filter(reporter=user).order_by('-created_at')

class ResolveReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, report_id):
        if request.user.user_type != 'moderator':
            return Response(
                {'error': 'Только модераторы могут обрабатывать жалобы'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            report = ModerationReport.objects.get(id=report_id)
        except ModerationReport.DoesNotExist:
            return Response(
                {'error': 'Жалоба не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ResolveReportSerializer(data=request.data)
        if serializer.is_valid():
            status_value = serializer.validated_data['status']
            resolution = serializer.validated_data['resolution']
            
            report.status = status_value
            report.resolution = resolution
            report.moderator = request.user
            report.resolved_at = timezone.now()
            report.save()
            
            # Если жалоба подтверждена, проверяем是否需要 банить пользователя
            if status_value == 'approved':
                self.check_user_ban(report.reported_user)
            
            return Response(ModerationReportSerializer(report).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def check_user_ban(self, user):
        # Проверяем количество подтвержденных жалоб
        approved_reports = ModerationReport.objects.filter(
            reported_user=user,
            status='approved'
        ).count()
        
        if approved_reports >= 3:
            # Баним пользователя на 7 дней
            ban_end = timezone.now() + timezone.timedelta(days=7)
            UserBan.objects.create(
                user=user,
                reason='3 или более подтвержденных жалоб',
                duration_days=7,
                end_date=ban_end,
                moderator=self.request.user
            )

class VerificationRequestCreateView(generics.CreateAPIView):
    serializer_class = VerificationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Проверяем, нет ли активных запросов
        active_requests = VerificationRequest.objects.filter(
            user=self.request.user,
            status='pending'
        ).exists()
        
        if active_requests:
            raise serializers.ValidationError('У вас уже есть активный запрос на верификацию')
        
        serializer.save(user=self.request.user)

class VerificationRequestListView(generics.ListAPIView):
    serializer_class = VerificationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'moderator':
            return VerificationRequest.objects.all().order_by('-created_at')
        
        # Обычные пользователи видят только свои запросы
        return VerificationRequest.objects.filter(user=user).order_by('-created_at')

class ProcessVerificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, request_id):
        if request.user.user_type != 'moderator':
            return Response(
                {'error': 'Только модераторы могут обрабатывать запросы на верификацию'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            verification_request = VerificationRequest.objects.get(id=request_id)
        except VerificationRequest.DoesNotExist:
            return Response(
                {'error': 'Запрос на верификацию не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ProcessVerificationSerializer(data=request.data)
        if serializer.is_valid():
            status_value = serializer.validated_data['status']
            comments = serializer.validated_data.get('comments', '')
            
            verification_request.status = status_value
            verification_request.comments = comments
            verification_request.moderator = request.user
            verification_request.save()
            
            # Обновляем статус пользователя
            user = verification_request.user
            if status_value == 'approved':
                user.is_verified = True
                user.verification_level = verification_request.verification_type
                user.save()
            
            return Response(VerificationRequestSerializer(verification_request).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserBanListView(generics.ListAPIView):
    serializer_class = UserBanSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.user_type != 'moderator':
            return UserBan.objects.none()
        
        return UserBan.objects.filter(is_active=True).order_by('-start_date')

class UnbanUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, user_id):
        if request.user.user_type != 'moderator':
            return Response(
                {'error': 'Только модераторы могут снимать баны'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            user_ban = UserBan.objects.get(user_id=user_id, is_active=True)
        except UserBan.DoesNotExist:
            return Response(
                {'error': 'Активный бан не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        user_ban.is_active = False
        user_ban.save()
        
        return Response({'detail': 'Бан снят'})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def moderation_stats(request):
    if request.user.user_type != 'moderator':
        return Response(
            {'error': 'Только модераторы могут просматривать статистику'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    pending_reports = ModerationReport.objects.filter(status='pending').count()
    pending_verifications = VerificationRequest.objects.filter(status='pending').count()
    active_bans = UserBan.objects.filter(is_active=True).count()
    
    reports_by_type = ModerationReport.objects.values('report_type').annotate(
        count=Count('id')
    )
    
    return Response({
        'pending_reports': pending_reports,
        'pending_verifications': pending_verifications,
        'active_bans': active_bans,
        'reports_by_type': list(reports_by_type)
    })