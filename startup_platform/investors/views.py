from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from .models import Investor, InvestmentPortfolio, InvestorReview
from .serializers import (
    InvestorListSerializer, InvestorDetailSerializer,
    InvestorCreateSerializer, InvestorReviewSerializer,
    InvestmentPortfolioSerializer
)

class InvestorListView(generics.ListAPIView):
    serializer_class = InvestorListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['investor_type', 'location', 'is_verified']
    search_fields = ['name', 'description', 'short_description']
    ordering_fields = ['rating', 'created_at', 'total_investments', 'views_count']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Investor.objects.filter(is_active=True).annotate(
            rating=Avg('reviews__rating'),
            reviews_count=Count('reviews'),
            total_investments=Count('portfolio_items'),
            total_amount_invested=Sum('portfolio_items__investment_amount')
        )
        
        # Фильтрация по диапазону чеков
        min_check = self.request.query_params.get('min_check')
        max_check = self.request.query_params.get('max_check')
        
        if min_check:
            queryset = queryset.filter(check_size_min__gte=min_check)
        if max_check:
            queryset = queryset.filter(check_size_max__lte=max_check)
        
        # Фильтрация по отраслям
        industries = self.request.query_params.getlist('industries')
        if industries:
            queryset = queryset.filter(industries__id__in=industries)
        
        # Фильтрация по стадиям
        stages = self.request.query_params.getlist('stages')
        if stages:
            queryset = queryset.filter(stages__overlap=stages)
        
        return queryset.distinct()

class InvestorDetailView(generics.RetrieveAPIView):
    serializer_class = InvestorDetailSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return Investor.objects.filter(is_active=True).annotate(
            rating=Avg('reviews__rating'),
            reviews_count=Count('reviews'),
            total_investments=Count('portfolio_items'),
            total_amount_invested=Sum('portfolio_items__investment_amount')
        )
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Увеличиваем счетчик просмотров
        instance.views_count += 1
        instance.save()
        
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

class InvestorCreateView(generics.CreateAPIView):
    serializer_class = InvestorCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class InvestorUpdateView(generics.UpdateAPIView):
    serializer_class = InvestorCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Investor.objects.filter(user=self.request.user)

class InvestorDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Investor.objects.filter(user=self.request.user)
    
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

class InvestorReviewCreateView(generics.CreateAPIView):
    serializer_class = InvestorReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        investor_id = self.kwargs['investor_id']
        investor = Investor.objects.get(id=investor_id)
        
        # Проверяем, не оставлял ли пользователь уже отзыв
        if InvestorReview.objects.filter(investor=investor, startup=self.request.user).exists():
            raise serializers.ValidationError('Вы уже оставляли отзыв для этого инвестора')
        
        serializer.save(startup=self.request.user, investor=investor)
        
        # Обновляем рейтинг инвестора
        self.update_investor_rating(investor)
    
    def update_investor_rating(self, investor):
        reviews = investor.reviews.filter(is_verified=True)
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        investor.rating = avg_rating
        investor.total_reviews = reviews.count()
        investor.save()

class UserInvestorsView(generics.ListAPIView):
    serializer_class = InvestorListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Investor.objects.filter(user=self.request.user, is_active=True).annotate(
            rating=Avg('reviews__rating'),
            reviews_count=Count('reviews'),
            total_investments=Count('portfolio_items'),
            total_amount_invested=Sum('portfolio_items__investment_amount')
        )

class PortfolioItemCreateView(generics.CreateAPIView):
    serializer_class = InvestmentPortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        investor = Investor.objects.get(user=self.request.user)
        serializer.save(investor=investor)

class PortfolioItemUpdateView(generics.UpdateAPIView):
    serializer_class = InvestmentPortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        investor = Investor.objects.get(user=self.request.user)
        return InvestmentPortfolio.objects.filter(investor=investor)

class PortfolioItemDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        investor = Investor.objects.get(user=self.request.user)
        return InvestmentPortfolio.objects.filter(investor=investor)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def investor_stats(request):
    total_investors = Investor.objects.filter(is_active=True).count()
    verified_investors = Investor.objects.filter(is_active=True, is_verified=True).count()
    
    by_type = Investor.objects.filter(is_active=True).values('investor_type').annotate(count=Count('id'))
    
    total_investments = InvestmentPortfolio.objects.count()
    total_invested = InvestmentPortfolio.objects.aggregate(
        total=Sum('investment_amount')
    )['total'] or 0
    
    return Response({
        'total_investors': total_investors,
        'verified_investors': verified_investors,
        'by_type': list(by_type),
        'total_investments': total_investments,
        'total_invested': float(total_invested)
    })