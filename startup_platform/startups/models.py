from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User

class Industry(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'industries'
        verbose_name = 'Отрасль'
        verbose_name_plural = 'Отрасли'
    
    def __str__(self):
        return self.name

class Startup(models.Model):
    STAGE_CHOICES = (
        ('idea', 'Идея'),
        ('prototype', 'Прототип'),
        ('mvp', 'MVP'),
        ('early_traction', 'Ранние продажи'),
        ('scaling', 'Масштабирование'),
        ('growth', 'Рост'),
        ('mature', 'Зрелая компания'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='startup_profile')
    name = models.CharField(max_length=255)
    description = models.TextField()
    short_description = models.CharField(max_length=300, blank=True, null=True)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES)
    industry = models.ForeignKey(Industry, on_delete=models.SET_NULL, null=True, related_name='startups')
    funding_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    raised_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    founded_year = models.IntegerField()
    website = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=100)
    has_mvp = models.BooleanField(default=False)
    pitch_deck = models.FileField(upload_to='pitch_decks/', blank=True, null=True)
    team_size = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    financial_info = models.TextField(blank=True, null=True)
    business_model = models.TextField(blank=True, null=True)
    competitive_advantage = models.TextField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(blank=True, null=True)
    rating = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(5.0)])
    total_reviews = models.IntegerField(default=0)
    views_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'startups'
        verbose_name = 'Стартап'
        verbose_name_plural = 'Стартапы'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name

class StartupTeamMember(models.Model):
    startup = models.ForeignKey(Startup, on_delete=models.CASCADE, related_name='team_members')
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=100)
    experience = models.TextField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    photo = models.ImageField(upload_to='team_photos/', blank=True, null=True)
    is_founder = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'startup_team_members'
        verbose_name = 'Член команды стартапа'
        verbose_name_plural = 'Члены команды стартапа'
        ordering = ['-is_founder', 'order']

class StartupImage(models.Model):
    startup = models.ForeignKey(Startup, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='startup_images/')
    caption = models.CharField(max_length=255, blank=True, null=True)
    is_main = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'startup_images'
        verbose_name = 'Изображение стартапа'
        verbose_name_plural = 'Изображения стартапов'
        ordering = ['-is_main', 'order']

class StartupReview(models.Model):
    startup = models.ForeignKey(Startup, on_delete=models.CASCADE, related_name='reviews')
    investor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_reviews')
    rating = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(5.0)])
    comment = models.TextField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'startup_reviews'
        verbose_name = 'Отзыв о стартапе'
        verbose_name_plural = 'Отзывы о стартапах'
        unique_together = ['startup', 'investor']