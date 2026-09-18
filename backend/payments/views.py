import hashlib
import hmac
import os
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from bookings.models import Booking
from users.models import User
from users.serializers import UserSerializer
from .models import Payment
from .serializers import PaymentSerializer


def error_response(message, status_code=400):
    return Response({'message': message}, status=status_code)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    """
    Initialize a new Razorpay checkout order for a booking.
    """
    booking_id = request.data.get('bookingId')
    booking = get_object_or_404(Booking, pk=booking_id)

    if booking.user_id != request.user.id:
        return error_response('Unauthorized transaction initiate request', 403)

    if booking.payment_status == Booking.PaymentStatus.PAID:
        return error_response('This booking has already been paid.')

    key_id = os.getenv('RAZORPAY_KEY_ID')
    secret = os.getenv('RAZORPAY_KEY_SECRET')

    if not key_id or not secret:
        return error_response('Razorpay Payment Gateway is not active. Real credentials must be supplied in backend/.env')

    try:
        import razorpay
        client = razorpay.Client(auth=(key_id, secret))

        # Amount must be in paise (1 INR = 100 Paise)
        amount_in_paise = int(booking.total_price * 100)

        order_payload = {
            'amount': amount_in_paise,
            'currency': 'INR',
            'receipt': str(booking.id),
            'payment_capture': 1
        }
        order = client.order.create(data=order_payload)

    except Exception as exc:
        return error_response(f'Razorpay Order initialization failed: {exc}', 500)

    return Response({
        'success': True,
        'orderId': order['id'],
        'amount': booking.total_price,
        'currency': 'INR',
        'bookingId': booking.id,
        'keyId': key_id
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """
    Verify Razorpay payment signature using HMAC-SHA256 and confirm the booking.
    """
    data = request.data
    booking_id = data.get('bookingId')
    razorpay_order_id = data.get('razorpayOrderId')
    razorpay_payment_id = data.get('razorpayPaymentId')
    razorpay_signature = data.get('razorpaySignature')

    if not booking_id or not razorpay_order_id or not razorpay_payment_id or not razorpay_signature:
        return error_response('Missing transaction parameters (razorpayOrderId, razorpayPaymentId, and razorpaySignature are required)')

    booking = get_object_or_404(Booking, pk=booking_id)

    if booking.user_id != request.user.id:
        return error_response('Unauthorized payment verification request', 403)

    secret = os.getenv('RAZORPAY_KEY_SECRET')
    if not secret:
        return error_response('Razorpay keys are not configured. Cannot verify cryptographic signature.')

    # Reconstruct HMAC-SHA256 signature for comparison
    generated_signature_data = f"{razorpay_order_id}|{razorpay_payment_id}".encode('utf-8')
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        generated_signature_data,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, razorpay_signature):
        booking.booking_status = Booking.Status.CANCELLED
        booking.payment_status = Booking.PaymentStatus.FAILED
        booking.save()
        return error_response('Invalid payment signature validation')

    # Signature is valid - confirm booking & record payment atomically
    with transaction.atomic():
        booking.booking_status = Booking.Status.CONFIRMED
        booking.payment_status = Booking.PaymentStatus.PAID
        booking.save()

        payment, _ = Payment.objects.get_or_create(
            razorpay_payment_id=razorpay_payment_id,
            defaults={
                'booking': booking,
                'razorpay_order_id': razorpay_order_id,
                'amount': booking.total_price,
                'payment_status': Booking.PaymentStatus.PAID
            }
        )

    # Lazy import to avoid circular dependency
    from bookings.serializers import BookingSerializer

    return Response({
        'success': True,
        'message': 'Payment verification completed. Booking confirmed.',
        'booking': BookingSerializer(booking).data,
        'payment': PaymentSerializer(payment).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_booking_receipt(request, booking_id):
    """
    Retrieve itemized invoice receipt details for a completed or confirmed booking.
    """
    booking = get_object_or_404(
        Booking.objects.select_related('user', 'turf', 'slot').prefetch_related('payments'),
        pk=booking_id
    )

    # User authorization check
    is_customer = booking.user_id == request.user.id
    is_admin = request.user.role == User.Role.ADMIN
    is_turf_owner = booking.turf.owner_id == request.user.id

    if not (is_customer or is_admin or is_turf_owner):
        return error_response('Unauthorized receipt access', 403)

    payment = booking.payments.first()

    return Response({
        'receiptId': f'REC-{str(booking.id)[:8].upper()}',
        'bookingDate': booking.booking_date,
        'createdAt': booking.created_at,
        'customer': UserSerializer(booking.user).data,
        'item': {
            'turfName': booking.turf.name,
            'address': booking.turf.address,
            'location': booking.turf.location,
            'timings': f'{booking.slot.start_time} - {booking.slot.end_time}'
        },
        'payment': {
            'totalPrice': booking.total_price,
            'status': booking.payment_status,
            'details': PaymentSerializer(payment).data if payment else None
        }
    })
