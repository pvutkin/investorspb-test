from django.db import models
from users.models import CustomUser


class Investor(models.Model):
    TYPES = [
        ('individual', 'Individual Investor'),
        ('fund', 'Fund'),
        ('corporate', 'Corporate'),
    ]
    name = models.CharField(max_length=200)
    investor_type = models.CharField(max_length=20, choices=TYPES)
    preferred_industries = models.CharField(max_length=500, blank=True)
    preferred_stages = models.CharField(max_length=500, blank=True)
    min_investment_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    max_investment_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class InvestorPortfolio(models.Model):
    investor = models.ForeignKey(Investor, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=200)
    investment_amount = models.DecimalField(max_digits=12, decimal_places=2)
    investment_date = models.DateField()
    investment_type = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.investor.name} - {self.company_name}"
