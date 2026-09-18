from datetime import date
from django.db import IntegrityError, transaction
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from common.permissions import IsAdminUser, IsTurfOwnerOrAdmin
from turfs.models import Slot, Turf
from turfs.serializers import SlotSerializer
from users.models import User
from users.serializers import UserSerializer
from .models import Booking
from .serializers import BookingSerializer


def error_response(message, status_code=400):
    return Response({'message': message}, status=status_code)


def is_owner_or_admin(user, turf):
    return user.role == User.Role.ADMIN or turf.owner_id == user.id


@api_view(['GET'])
@permission_classes([AllowAny])
def check_availability(request):
    """
    Check availability of all slots for a specific turf on a given date.
    Returns slot list with `isBooked: true/false`.
    """
    turf_id = request.query_params.get('turfId')
    date_str = request.query_params.get('date')

    if not turf_id or not date_str:
        return error_response('Both turfId and date are required')

    turf = get_object_or_404(Turf.objects.prefetch_related('slots'), pk=turf_id)

    try:
        booking_day = date.fromisoformat(date_str)
    except ValueError:
        return error_response('date must be YYYY-MM-DD')

    if booking_day < date.today():
        return error_response('You can only check availability for today or a future date')

    # Get slot IDs that have PENDING or CONFIRMED bookings on this date
    booked_slot_ids = set(
        Booking.objects.filter(
            turf=turf,
            booking_date=booking_day,
            booking_status__in=[Booking.Status.PENDING, Booking.Status.CONFIRMED]
        ).values_list('slot_id', flat=True)
    )

    slots_data = SlotSerializer(turf.slots.all(), many=True).data
    for slot in slots_data:
        slot['isBooked'] = str(slot['id']) in {str(sid) for sid in booked_slot_ids}

    return Response({
        'date': date_str,
        'pricePerHour': turf.price_per_hour,
        'slots': slots_data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):
    """
    Reserve a turf slot for a given date.
    Prevents duplicate bookings using transaction.atomic and select_for_update row locks.
    """
    data = request.data
    turf_id = data.get('turfId')
    slot_id = data.get('slotId')
    booking_date_str = data.get('bookingDate')

    if not turf_id or not slot_id or not booking_date_str:
        return error_response('Please provide turfId, slotId and bookingDate')

    try:
        booking_day = date.fromisoformat(booking_date_str)
    except ValueError:
        return error_response('bookingDate must be YYYY-MM-DD')

    if booking_day < date.today():
        return error_response('Booking date cannot be in the past')

    try:
        with transaction.atomic():
            # Lock the slot row during transaction check
            slot = Slot.objects.select_for_update().select_related('turf').get(pk=slot_id)

            if str(slot.turf_id) != str(turf_id):
                return error_response('Selected slot is invalid or does not belong to this turf')

            # Check if an active booking already exists
            existing_booking = Booking.objects.filter(
                slot=slot,
                booking_date=booking_day,
                booking_status__in=[Booking.Status.PENDING, Booking.Status.CONFIRMED]
            ).exists()

            if existing_booking:
                return error_response('This slot is already booked or reserved by another transaction.', 409)

            # Create the booking record
            booking = Booking.objects.create(
                user=request.user,
                turf=slot.turf,
                slot=slot,
                booking_date=booking_day,
                total_price=slot.turf.price_per_hour
            )

    except Slot.DoesNotExist:
        return error_response('Selected slot is invalid or does not belong to this turf')
    except IntegrityError:
        return error_response('This slot was just booked by another team. Please choose a different slot.', 409)

    return Response({
        'message': 'Slot reserved successfully. Proceed to payment page.',
        'booking': BookingSerializer(booking).data
    }, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_history(request):
    """
    Retrieve booking history for the logged-in player.
    """
    bookings = Booking.objects.filter(user=request.user).select_related('turf', 'slot').order_by('-created_at')
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsTurfOwnerOrAdmin])
def owner_ledgers(request):
    """
    Retrieve booking records for turfs owned by the logged-in owner.
    """
    bookings = Booking.objects.filter(turf__owner=request.user).select_related('user', 'turf', 'slot').order_by('-created_at')
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, id):
    """
    Cancel an existing booking (allowed for booking owner, turf owner, or admin).
    """
    booking = get_object_or_404(Booking.objects.select_related('turf', 'slot'), pk=id)

    if booking.user_id != request.user.id and not is_owner_or_admin(request.user, booking.turf):
        return error_response('Not authorized to cancel this booking', 403)

    booking.booking_status = Booking.Status.CANCELLED
    if booking.payment_status == Booking.PaymentStatus.PAID:
        booking.payment_status = Booking.PaymentStatus.PENDING
    else:
        booking.payment_status = Booking.PaymentStatus.FAILED

    booking.save()

    return Response({
        'message': 'Booking cancelled successfully.',
        'booking': BookingSerializer(booking).data
    })


@api_view(['PUT'])
@permission_classes([IsTurfOwnerOrAdmin])
def update_booking_status(request, id):
    """
    Update booking status (CONFIRMED, COMPLETED, CANCELLED).
    """
    new_status = request.data.get('status')
    if new_status not in [Booking.Status.CONFIRMED, Booking.Status.COMPLETED, Booking.Status.CANCELLED]:
        return error_response('Invalid booking status code')

    booking = get_object_or_404(Booking.objects.select_related('turf', 'slot'), pk=id)

    if not is_owner_or_admin(request.user, booking.turf):
        return error_response('Not authorized to modify this booking', 403)

    booking.booking_status = new_status
    booking.save()

    return Response({
        'message': f'Booking status updated to {new_status} successfully.',
        'booking': BookingSerializer(booking).data
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_admin_analytics(request):
    """
    Admin View: Platform summary statistics and recent activity dashboard.
    """
    total_users = User.objects.filter(role=User.Role.USER).count()
    total_owners = User.objects.filter(role=User.Role.TURF_OWNER).count()
    total_turfs = Turf.objects.count()
    total_bookings = Booking.objects.count()

    revenue_aggregate = Booking.objects.filter(payment_status=Booking.PaymentStatus.PAID).aggregate(value=Sum('total_price'))
    total_revenue = revenue_aggregate['value'] or 0

    recent_bookings = Booking.objects.select_related('user', 'turf', 'slot').order_by('-created_at')[:5]
    recent_users = User.objects.order_by('-created_at')[:5]

    return Response({
        'metrics': {
            'totalUsers': total_users,
            'totalOwners': total_owners,
            'totalTurfs': total_turfs,
            'totalBookings': total_bookings,
            'totalRevenue': total_revenue,
        },
        'recentBookings': BookingSerializer(recent_bookings, many=True).data,
        'recentUsers': UserSerializer(recent_users, many=True).data,
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_admin_bookings(request):
    """
    Admin View: Retrieve all bookings across the platform.
    """
    bookings = Booking.objects.select_related('user', 'turf', 'slot').order_by('-created_at')
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)
