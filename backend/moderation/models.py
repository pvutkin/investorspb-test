from django.db import models
from users.models import CustomUser
from startups.models import Startup
from investors.models import Investor
from messaging.models import Message


class Complaint(models.Model):
    COMPLAINT_TYPES = [
        ('fraud', 'Fraud'),
        ('spam', 'Spam'),
        ('inappropriate', 'Inappropriate Content'),
    ]
    reporter = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='complaints')
    target_startup = models.ForeignKey(Startup, on_delete=models.CASCADE, null=True, blank=True)
    target_investor = models.ForeignKey(Investor, on_delete=models.CASCADE, null=True, blank=True)
    target_message = models.ForeignKey(Message, on_delete=models.CASCADE, null=True, blank=True)
    complaint_type = models.CharField(max_length=20, choices=COMPLAINT_TYPES)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)
    resolution_notes = models.TextField(blank=True)

    def __str__(self):
        return f"Complaint by {self.reporter.username}"
