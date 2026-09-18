from rest_framework import serializers
from turfs.serializers import SlotSerializer, TurfSerializer
from users.serializers import UserSerializer
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    """
    Serializer to convert Booking model to/from camelCase JSON objects.
    """
    bookingDate = serializers.DateField(source='booking_date')
    totalPrice = serializers.DecimalField(
        source='total_price',
        max_digits=10,
        decimal_places=2
    )
    bookingStatus = serializers.CharField(source='booking_status')
    paymentStatus = serializers.CharField(source='payment_status')

    turfId = serializers.UUIDField(
        source='turf_id',
        write_only=True,
        required=False
    )
    slotId = serializers.UUIDField(
        source='slot_id',
        write_only=True,
        required=False
    )
    userId = serializers.UUIDField(
        source='user_id',
        read_only=True
    )

    user = UserSerializer(read_only=True)
    turf = TurfSerializer(read_only=True)
    slot = SlotSerializer(read_only=True)
    createdAt = serializers.DateTimeField(
        source='created_at',
        read_only=True
    )

    class Meta:
        model = Booking
        fields = [
            'id',
            'bookingDate',
            'totalPrice',
            'bookingStatus',
            'paymentStatus',
            'userId',
            'turfId',
            'slotId',
            'user',
            'turf',
            'slot',
            'createdAt',
        ]
