from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer to convert User model into camelCase JSON for frontend compatibility.
    """
    profileImage = serializers.CharField(
        source='profile_image',
        required=False,
        allow_blank=True
    )
    createdAt = serializers.DateTimeField(
        source='created_at',
        read_only=True
    )

    class Meta:
        model = User
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'role',
            'profileImage',
            'createdAt',
        ]
