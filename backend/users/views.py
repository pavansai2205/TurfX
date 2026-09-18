from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from common.permissions import IsAdminUser
from .models import User
from .serializers import UserSerializer


def get_jwt_token(user):
    """
    Helper function to generate a JWT access token for a user.
    """
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


def error_response(message, status_code=400):
    """
    Helper function to return a uniform error response.
    """
    return Response({'message': message}, status=status_code)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user account (Player, Turf Owner, or Admin).
    """
    data = request.data
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')

    # Simple input validation
    if not name or not email or not password or not phone:
        return error_response('name, email, password and phone are required')

    # Check for existing email
    if User.objects.filter(email__iexact=email).exists():
        return error_response('User already exists with this email address')

    # Validate role if provided
    role = data.get('role', User.Role.USER)
    if role not in User.Role.values:
        role = User.Role.USER

    # Create new user
    profile_image = f"https://api.dicebear.com/7.x/adventurer/svg?seed={name}"
    user = User.objects.create_user(
        email=email,
        password=password,
        name=name,
        phone=phone,
        role=role,
        profile_image=profile_image
    )

    token = get_jwt_token(user)
    serializer = UserSerializer(user)

    return Response({
        'token': token,
        'user': serializer.data
    }, status=201)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Authenticate an existing user and return a JWT access token.
    """
    email = request.data.get('email', '')
    password = request.data.get('password', '')

    user = User.objects.filter(email__iexact=email).first()

    if not user or not user.check_password(password):
        return error_response('Invalid email or password', 401)

    token = get_jwt_token(user)
    serializer = UserSerializer(user)

    return Response({
        'token': token,
        'user': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """
    Fetch current authenticated user's profile details.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    Simulate sending a password reset email link.
    """
    email = request.data.get('email')

    if not email:
        return error_response('Email address is required')

    if not User.objects.filter(email__iexact=email).exists():
        return error_response('No account registered under this email', 404)

    return Response({
        'message': f'A secure password reset link has been dispatched to {email}. (Simulated Success)'
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def profile(request):
    """
    Update the logged-in user's profile details (name, phone, profileImage).
    """
    user = request.user
    data = request.data

    if 'name' in data:
        user.name = data['name']
    if 'phone' in data:
        user.phone = data['phone']
    if 'profileImage' in data:
        user.profile_image = data['profileImage']

    user.save()
    serializer = UserSerializer(user)

    return Response({
        'message': 'Profile updated successfully',
        'user': serializer.data
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change the logged-in user's password.
    """
    current_password = request.data.get('currentPassword')
    new_password = request.data.get('newPassword')

    if not current_password or not new_password:
        return error_response('Both current password and new password are required')

    if len(new_password) < 6:
        return error_response('New password must be at least 6 characters')

    if not request.user.check_password(current_password):
        return error_response('Current password provided is incorrect')

    request.user.set_password(new_password)
    request.user.save()

    return Response({'message': 'Password updated successfully'})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users(request):
    """
    Admin View: Retrieve all registered users sorted by creation date.
    """
    users = User.objects.order_by('-created_at')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_user(request, id):
    """
    Admin View: Update a user's role or delete a user account.
    """
    user = get_object_or_404(User, pk=id)

    if request.method == 'DELETE':
        if user.id == request.user.id:
            return error_response('Self-deletion of administrator account is blocked')

        user.delete()
        return Response({'message': 'User account has been permanently removed from the system'})

    role = request.data.get('role')
    if role not in User.Role.values:
        return error_response('Invalid role code')

    user.role = role
    user.save(update_fields=['role'])
    serializer = UserSerializer(user)

    return Response({
        'message': f'User role changed to {role} successfully.',
        'user': serializer.data
    })
