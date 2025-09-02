from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import datetime
from users.models import CustomUser


class Startup(models.Model):
    STAGES = [
        ('idea', 'Idea'),
        ('prototype', 'Prototype'),
        ('pre_launch', 'Pre-Launch'),
        ('launch', 'Launch'),
        ('growth', 'Growth'),
    ]
    name = models.CharField(max_length=200)
    description = models.TextField()
    stage = models.CharField(max_length=20, choices=STAGES)
    industry = models.CharField(max_length=100)
    funding_requested = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    founded_year = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1900), MaxValueValidator(datetime.date.today().year)]
    )
    website = models.URLField(blank=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class StartupTeam(models.Model):
    startup = models.ForeignKey(Startup, on_delete=models.CASCADE)
    member_name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    experience_years = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.member_name} - {self.startup.name}"


class StartupFinancials(models.Model):
    startup = models.OneToOneField(Startup, on_delete=models.CASCADE)
    revenue = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    expenses = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    cash_flow = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.startup.name} Financials"
