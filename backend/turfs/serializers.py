from rest_framework import serializers
from users.serializers import UserSerializer
from .models import Slot, Turf


class SlotSerializer(serializers.ModelSerializer):
    """
    Serializer to convert Slot model into camelCase JSON for frontend.
    """
    startTime = serializers.CharField(source='start_time')
    endTime = serializers.CharField(source='end_time')

    class Meta:
        model = Slot
        fields = ['id', 'startTime', 'endTime']


class TurfSerializer(serializers.ModelSerializer):
    """
    Serializer for Turf listing summaries.
    """
    pricePerHour = serializers.DecimalField(
        source='price_per_hour',
        max_digits=10,
        decimal_places=2
    )
    ownerId = serializers.UUIDField(
        source='owner_id',
        read_only=True
    )
    createdAt = serializers.DateTimeField(
        source='created_at',
        read_only=True
    )
    updatedAt = serializers.DateTimeField(
        source='updated_at',
        read_only=True
    )

    class Meta:
        model = Turf
        fields = [
            'id',
            'name',
            'description',
            'location',
            'address',
            'pricePerHour',
            'images',
            'amenities',
            'rating',
            'ownerId',
            'createdAt',
            'updatedAt',
        ]


class TurfDetailSerializer(TurfSerializer):
    """
    Detailed serializer for single Turf view, including owner profile, slots, and reviews.
    """
    owner = UserSerializer(read_only=True)
    slots = SlotSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()

    class Meta(TurfSerializer.Meta):
        fields = TurfSerializer.Meta.fields + ['owner', 'slots', 'reviews']

    def get_reviews(self, obj):
        # Lazy import to avoid circular dependencies between turfs and reviews
        from reviews.serializers import ReviewSerializer
        return ReviewSerializer(obj.reviews.all(), many=True).data
