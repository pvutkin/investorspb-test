from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from django.utils import timezone
from .models import Industry, Startup, StartupReview
from .serializers import (
    IndustrySerializer, StartupListSerializer,
    StartupDetailSerializer, StartupCreateSerializer,
    StartupReviewSerializer
)

class IndustryListView(generics.ListAPIView):
    queryset = Industry.objects.all()
    serializer_class = IndustrySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class StartupListView(generics.ListAPIView):
    serializer_class = StartupListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['stage', 'industry', 'location', 'has_mvp', 'is_verified']
    search_fields = ['name', 'description', 'short_description']
    ordering_fields = ['rating', 'created_at', 'funding_amount', 'views_count']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Startup.objects.filter(is_active=True).annotate(
            rating=Avg('reviews__rating'),
            reviews_count=Count('reviews')
        )
        
        # Фильтрация по диапазону сумм
        min_funding = self.request.query_params.get('min_funding')
        max_funding = self.request.query_params.get('max_funding')
        
        if min_funding:
            queryset = queryset.filter(funding_amount__gte=min_funding)
        if max_funding:
            queryset = queryset.filter(funding_amount__lte=max_funding)
        
        # Фильтрация по году основания
        min_year = self.request.query_params.get('min_year')
        max_year = self.request.query_params.get('max_year')
        
        if min_year:
            queryset = queryset.filter(founded_year__gte=min_year)
        if max_year:
            queryset = queryset.filter(founded_year__lte=max_year)
        
        return queryset

class StartupDetailView(generics.RetrieveAPIView):
    serializer_class = StartupDetailSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return Startup.objects.filter(is_active=True).annotate(
            rating=Avg('reviews__rating'),
            reviews_count=Count('reviews')
        )
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Увеличиваем счетчик просмотров
        instance.views_count += 1
        instance.save()
        
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

class StartupCreateView(generics.CreateAPIView):
    serializer_class = StartupCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class StartupUpdateView(generics.UpdateAPIView):
    serializer_class = StartupCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Startup.objects.filter(user=self.request.user)

class StartupDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Startup.objects.filter(user=self.request.user)
    
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

class StartupReviewCreateView(generics.CreateAPIView):
    serializer_class = StartupReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        startup_id = self.kwargs['startup_id']
        startup = Startup.objects.get(id=startup_id)
        
        # Проверяем, не оставлял ли пользователь уже отзыв
        if StartupReview.objects.filter(startup=startup, investor=self.request.user).exists():
            raise serializers.ValidationError('Вы уже оставляли отзыв для этого стартапа')
        
        serializer.save(investor=self.request.user, startup=startup)
        
        # Обновляем рейтинг стартапа
        self.update_startup_rating(startup)
    
    def update_startup_rating(self, startup):
        reviews = startup.reviews.filter(is_verified=True)
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        startup.rating = avg_rating
        startup.total_reviews = reviews.count()
        startup.save()

class UserStartupsView(generics.ListAPIView):
    serializer_class = StartupListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Startup.objects.filter(user=self.request.user, is_active=True).annotate(
            rating=Avg('reviews__rating'),
            reviews_count=Count('reviews')
        )

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def startup_stats(request):
    total_startups = Startup.objects.filter(is_active=True).count()
    verified_startups = Startup.objects.filter(is_active=True, is_verified=True).count()
    avg_funding = Startup.objects.filter(is_active=True).aggregate(Avg('funding_amount'))['funding_amount__avg'] or 0
    by_stage = Startup.objects.filter(is_active=True).values('stage').annotate(count=Count('id'))
    by_industry = Startup.objects.filter(is_active=True).values('industry__name').annotate(count=Count('id'))
    
    return Response({
        'total_startups': total_startups,
        'verified_startups': verified_startups,
        'average_funding': float(avg_funding),
        'by_stage': list(by_stage),
        'by_industry': list(by_industry)
    })