from rest_framework import serializers
from users.serializers import UserSerializer
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for Review model with user profile object and camelCase JSON fields.
    """
    user = UserSerializer(read_only=True)
    turfId = serializers.UUIDField(
        source='turf_id',
        write_only=True,
        required=False
    )
    createdAt = serializers.DateTimeField(
        source='created_at',
        read_only=True
    )

    class Meta:
        model = Review
        fields = [
            'id',
            'rating',
            'comment',
            'turfId',
            'user',
            'createdAt',
        ]
