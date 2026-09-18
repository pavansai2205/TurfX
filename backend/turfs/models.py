import uuid
from django.conf import settings
from django.db import models


class Turf(models.Model):
    """
    Represents a sports turf / stadium arena listed on TurfX.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=120)
    address = models.TextField()
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    images = models.JSONField(default=list)
    amenities = models.JSONField(default=list)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='turfs'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.location}"


class Slot(models.Model):
    """
    Represents an hourly time slot for a specific turf arena.
    Example: 10:00 to 11:00.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    turf = models.ForeignKey(
        Turf,
        on_delete=models.CASCADE,
        related_name='slots'
    )
    start_time = models.CharField(max_length=5)
    end_time = models.CharField(max_length=5)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['turf', 'start_time', 'end_time'],
                name='unique_turf_slot'
            )
        ]

    def __str__(self):
        return f"{self.turf.name}: {self.start_time} - {self.end_time}"
