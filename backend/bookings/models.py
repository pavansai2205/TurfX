import uuid
from django.conf import settings
from django.db import models
from turfs.models import Slot, Turf


class Booking(models.Model):
    """
    Represents a turf slot booking made by a player.
    Enforces a database constraint to prevent duplicate active bookings on the same date & slot.
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        COMPLETED = 'COMPLETED', 'Completed'

    class PaymentStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PAID = 'PAID', 'Paid'
        FAILED = 'FAILED', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking_date = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    booking_status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    turf = models.ForeignKey(
        Turf,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    slot = models.ForeignKey(
        Slot,
        on_delete=models.CASCADE,
        related_name='bookings'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['turf', 'booking_date'])
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['turf', 'booking_date', 'slot'],
                condition=models.Q(booking_status__in=['PENDING', 'CONFIRMED']),
                name='unique_active_booking_per_slot'
            )
        ]

    def __str__(self):
        return f"Booking {self.id}: {self.user.name} @ {self.turf.name} on {self.booking_date}"
