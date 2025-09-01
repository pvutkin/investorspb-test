from rest_framework import serializers
from .models import Industry, Startup, StartupTeamMember, StartupImage, StartupReview

class IndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Industry
        fields = '__all__'

class StartupTeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = StartupTeamMember
        fields = '__all__'
        read_only_fields = ('startup',)

class StartupImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = StartupImage
        fields = '__all__'
        read_only_fields = ('startup',)

class StartupReviewSerializer(serializers.ModelSerializer):
    investor_name = serializers.CharField(source='investor.get_full_name', read_only=True)
    investor_avatar = serializers.ImageField(source='investor.avatar', read_only=True)
    
    class Meta:
        model = StartupReview
        fields = '__all__'
        read_only_fields = ('investor', 'created_at', 'updated_at', 'is_verified')
    
    def validate_rating(self, value):
        if value < 0 or value > 5:
            raise serializers.ValidationError("Рейтинг должен быть от 0 до 5")
        return value

class StartupListSerializer(serializers.ModelSerializer):
    industry_name = serializers.CharField(source='industry.name', read_only=True)
    rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(source='reviews.count', read_only=True)
    
    class Meta:
        model = Startup
        fields = (
            'id', 'name', 'short_description', 'stage', 'industry', 'industry_name',
            'funding_amount', 'location', 'rating', 'reviews_count', 'views_count',
            'created_at', 'is_verified'
        )

class StartupDetailSerializer(serializers.ModelSerializer):
    industry = IndustrySerializer(read_only=True)
    team_members = StartupTeamMemberSerializer(many=True, read_only=True)
    images = StartupImageSerializer(many=True, read_only=True)
    reviews = StartupReviewSerializer(many=True, read_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(source='reviews.count', read_only=True)
    is_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = Startup
        fields = '__all__'
        read_only_fields = ('user', 'is_verified', 'verification_date', 'rating', 
                          'total_reviews', 'views_count', 'created_at', 'updated_at')
    
    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False

class StartupCreateSerializer(serializers.ModelSerializer):
    team_members = StartupTeamMemberSerializer(many=True, required=False)
    images = StartupImageSerializer(many=True, required=False)
    
    class Meta:
        model = Startup
        exclude = ('user', 'is_verified', 'verification_date', 'rating', 
                 'total_reviews', 'views_count', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        team_members_data = validated_data.pop('team_members', [])
        images_data = validated_data.pop('images', [])
        
        startup = Startup.objects.create(**validated_data)
        
        for member_data in team_members_data:
            StartupTeamMember.objects.create(startup=startup, **member_data)
        
        for image_data in images_data:
            StartupImage.objects.create(startup=startup, **image_data)
        
        return startup
    
    def update(self, instance, validated_data):
        team_members_data = validated_data.pop('team_members', None)
        images_data = validated_data.pop('images', None)
        
        # Update startup fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update team members if provided
        if team_members_data is not None:
            instance.team_members.all().delete()
            for member_data in team_members_data:
                StartupTeamMember.objects.create(startup=instance, **member_data)
        
        # Update images if provided
        if images_data is not None:
            instance.images.all().delete()
            for image_data in images_data:
                StartupImage.objects.create(startup=instance, **image_data)
        
        return instance