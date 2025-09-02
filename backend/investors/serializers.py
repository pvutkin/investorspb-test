from rest_framework import serializers
from .models import Investor, InvestmentPortfolio, InvestorReview
from startups.serializers import IndustrySerializer

class InvestmentPortfolioSerializer(serializers.ModelSerializer):
    industry_name = serializers.CharField(source='industry.name', read_only=True)
    
    class Meta:
        model = InvestmentPortfolio
        fields = '__all__'
        read_only_fields = ('investor',)

class InvestorReviewSerializer(serializers.ModelSerializer):
    startup_name = serializers.CharField(source='startup.startup_profile.name', read_only=True)
    startup_avatar = serializers.ImageField(source='startup.avatar', read_only=True)
    
    class Meta:
        model = InvestorReview
        fields = '__all__'
        read_only_fields = ('startup', 'created_at', 'updated_at', 'is_verified')
    
    def validate_rating(self, value):
        if value < 0 or value > 5:
            raise serializers.ValidationError("Рейтинг должен быть от 0 до 5")
        return value

class InvestorListSerializer(serializers.ModelSerializer):
    rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(source='reviews.count', read_only=True)
    industries_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Investor
        fields = (
            'id', 'name', 'investor_type', 'short_description', 'check_size_min',
            'check_size_max', 'location', 'rating', 'reviews_count', 'total_investments',
            'views_count', 'is_verified', 'created_at', 'industries_list'
        )
    
    def get_industries_list(self, obj):
        return [industry.name for industry in obj.industries.all()]

class InvestorDetailSerializer(serializers.ModelSerializer):
    industries = IndustrySerializer(many=True, read_only=True)
    portfolio_items = InvestmentPortfolioSerializer(many=True, read_only=True)
    reviews = InvestorReviewSerializer(many=True, read_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(source='reviews.count', read_only=True)
    is_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = Investor
        fields = '__all__'
        read_only_fields = ('user', 'is_verified', 'verification_date', 'rating', 
                          'total_reviews', 'total_investments', 'total_amount_invested',
                          'views_count', 'created_at', 'updated_at')
    
    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False

class InvestorCreateSerializer(serializers.ModelSerializer):
    portfolio_items = InvestmentPortfolioSerializer(many=True, required=False)
    industries = serializers.ListField(child=serializers.IntegerField(), write_only=True)
    
    class Meta:
        model = Investor
        exclude = ('user', 'is_verified', 'verification_date', 'rating', 
                 'total_reviews', 'total_investments', 'total_amount_invested',
                 'views_count', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        portfolio_items_data = validated_data.pop('portfolio_items', [])
        industries_ids = validated_data.pop('industries', [])
        
        investor = Investor.objects.create(**validated_data)
        
        # Add industries
        investor.industries.set(industries_ids)
        
        for portfolio_data in portfolio_items_data:
            InvestmentPortfolio.objects.create(investor=investor, **portfolio_data)
        
        return investor
    
    def update(self, instance, validated_data):
        portfolio_items_data = validated_data.pop('portfolio_items', None)
        industries_ids = validated_data.pop('industries', None)
        
        # Update investor fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update industries if provided
        if industries_ids is not None:
            instance.industries.set(industries_ids)
        
        # Update portfolio items if provided
        if portfolio_items_data is not None:
            instance.portfolio_items.all().delete()
            for portfolio_data in portfolio_items_data:
                InvestmentPortfolio.objects.create(investor=instance, **portfolio_data)
        
        return instance