import uuid
from django.conf import settings
from django.db import models
from turfs.models import Turf


class Review(models.Model):
    """
    Represents a player review and rating for a specific turf.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField()

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    turf = models.ForeignKey(
        Turf,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review ({self.rating}/5) by {self.user.name} for {self.turf.name}"
