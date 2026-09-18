import uuid
from bookings.models import Booking
from django.db import models


class Payment(models.Model):
    """
    Represents a payment transaction processed via Razorpay.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    razorpay_order_id = models.CharField(
        max_length=120,
        unique=True,
        null=True,
        blank=True
    )
    razorpay_payment_id = models.CharField(
        max_length=120,
        unique=True,
        null=True,
        blank=True
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(
        max_length=20,
        choices=Booking.PaymentStatus.choices,
        default=Booking.PaymentStatus.PENDING
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment {self.id} for Booking {self.booking.id} - Status: {self.payment_status}"
