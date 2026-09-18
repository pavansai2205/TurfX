from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from users.models import User
from .models import Slot, Turf
from .serializers import SlotSerializer, TurfDetailSerializer, TurfSerializer


def error_response(message, status_code=400):
    return Response({'message': message}, status=status_code)


def is_owner_or_admin(user, turf):
    return user.role == User.Role.ADMIN or turf.owner_id == user.id


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def list_or_create_turfs(request):
    """
    GET: Retrieve filtered, paginated list of turfs.
    POST: Create a new turf listing (Turf Owner or Admin only) and auto-generate 16 hourly slots.
    """
    if request.method == 'POST':
        # Authentication & Authorization Check for creation
        if not request.user.is_authenticated or request.user.role not in [User.Role.TURF_OWNER, User.Role.ADMIN]:
            return error_response('Authentication credentials were not provided', 401)

        serializer = TurfSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        turf = serializer.save(owner=request.user)

        # Auto-generate 16 hourly slots from 06:00 to 22:00
        slots_to_create = []
        for hour in range(6, 22):
            slots_to_create.append(
                Slot(
                    turf=turf,
                    start_time=f'{hour:02d}:00',
                    end_time=f'{hour+1:02d}:00'
                )
            )
        Slot.objects.bulk_create(slots_to_create)

        # Return full detail serializer with prefetched slots
        full_turf = Turf.objects.prefetch_related('slots').get(pk=turf.pk)
        return Response({
            'message': 'Turf listing created successfully. Hourly slots generated.',
            'turf': TurfDetailSerializer(full_turf).data
        }, status=201)

    # Handling GET request - Filtering & Pagination
    items = Turf.objects.all().order_by('-created_at')
    params = request.query_params

    if params.get('ownerId'):
        items = items.filter(owner_id=params['ownerId'])

    if params.get('search'):
        search_query = params['search']
        items = items.filter(
            Q(name__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(address__icontains=search_query)
        )

    if params.get('location'):
        items = items.filter(location__icontains=params['location'])

    if params.get('minPrice'):
        items = items.filter(price_per_hour__gte=params['minPrice'])

    if params.get('maxPrice'):
        items = items.filter(price_per_hour__lte=params['maxPrice'])

    if params.get('minRating'):
        items = items.filter(rating__gte=params['minRating'])

    total_count = items.count()
    page = int(params.get('page', 1))
    limit = int(params.get('limit', 9))
    start_index = (page - 1) * limit
    end_index = start_index + limit

    paginated_items = items[start_index:end_index]
    total_pages = (total_count + limit - 1) // limit

    return Response({
        'turfs': TurfSerializer(paginated_items, many=True).data,
        'pagination': {
            'total': total_count,
            'page': page,
            'limit': limit,
            'totalPages': total_pages
        }
    })


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def turf_detail_view(request, id):
    """
    GET: Fetch full turf details including owner info, hourly slots, and reviews.
    PUT: Update turf details (Owner or Admin only).
    DELETE: Delete turf listing (Owner or Admin only).
    """
    turf = get_object_or_404(
        Turf.objects.select_related('owner').prefetch_related('slots', 'reviews__user'),
        pk=id
    )

    if request.method == 'GET':
        return Response(TurfDetailSerializer(turf).data)

    if not request.user.is_authenticated:
        return error_response('Authentication credentials were not provided', 401)

    if not is_owner_or_admin(request.user, turf):
        return error_response('Not authorized to modify this turf', 403)

    if request.method == 'DELETE':
        turf.delete()
        return Response({'message': 'Turf listing deleted successfully'})

    # PUT request - Partial update supported
    serializer = TurfSerializer(turf, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response({
        'message': 'Turf updated successfully',
        'turf': serializer.data
    })
