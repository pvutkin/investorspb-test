from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User
from startups.models import Industry

class Investor(models.Model):
    INVESTOR_TYPES = (
        ('angel', 'Бизнес-ангел'),
        ('vc', 'Венчурный фонд'),
        ('private', 'Частный инвестор'),
        ('corporate', 'Корпоративный инвестор'),
        ('syndicate', 'Синдикат'),
        ('family_office', 'Семейный офис'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='investor_profile')
    name = models.CharField(max_length=255)
    investor_type = models.CharField(max_length=20, choices=INVESTOR_TYPES)
    description = models.TextField(blank=True, null=True)
    short_description = models.CharField(max_length=300, blank=True, null=True)
    industries = models.ManyToManyField(Industry, related_name='investors', blank=True)
    stages = models.JSONField(default=list)
    check_size_min = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    check_size_max = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    location = models.CharField(max_length=100)
    portfolio = models.TextField(blank=True, null=True)
    experience = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(blank=True, null=True)
    rating = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(5.0)])
    total_reviews = models.IntegerField(default=0)
    total_investments = models.IntegerField(default=0)
    total_amount_invested = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    views_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'investors'
        verbose_name = 'Инвестор'
        verbose_name_plural = 'Инвесторы'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name

class InvestmentPortfolio(models.Model):
    investor = models.ForeignKey(Investor, on_delete=models.CASCADE, related_name='portfolio_items')
    startup_name = models.CharField(max_length=255)
    industry = models.ForeignKey(Industry, on_delete=models.SET_NULL, null=True, blank=True)
    investment_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    investment_date = models.DateField()
    exit_date = models.DateField(blank=True, null=True)
    return_multiple = models.FloatField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'investment_portfolios'
        verbose_name = 'Портфельная инвестиция'
        verbose_name_plural = 'Портфельные инвестиции'
        ordering = ['-investment_date']

class InvestorReview(models.Model):
    investor = models.ForeignKey(Investor, on_delete=models.CASCADE, related_name='reviews')
    startup = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_investor_reviews')
    rating = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(5.0)])
    comment = models.TextField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'investor_reviews'
        verbose_name = 'Отзыв об инвесторе'
        verbose_name_plural = 'Отзывы об инвесторах'
        unique_together = ['investor', 'startup']