from django.db.models import Avg
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from bookings.models import Booking
from turfs.models import Turf
from users.models import User
from .models import Review
from .serializers import ReviewSerializer


def error_response(message, status_code=400):
    return Response({'message': message}, status=status_code)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review(request):
    """
    Submit a review and rating (1 to 5) for a turf.
    Recalculates the turf's average rating upon save.
    """
    turf_id = request.data.get('turfId')
    turf = get_object_or_404(Turf, pk=turf_id)

    try:
        rating = int(request.data.get('rating'))
    except (ValueError, TypeError):
        return error_response('rating must be a number from 1 to 5')

    if rating not in range(1, 6):
        return error_response('rating must be a number from 1 to 5')

    comment = request.data.get('comment', '')

    review = Review.objects.create(
        user=request.user,
        turf=turf,
        rating=rating,
        comment=comment
    )

    # Recalculate average rating for the turf
    avg_rating = Review.objects.filter(turf=turf).aggregate(val=Avg('rating'))['val'] or 0
    turf.rating = avg_rating
    turf.save(update_fields=['rating'])

    has_booked = Booking.objects.filter(
        user=request.user,
        turf=turf,
        booking_status=Booking.Status.CONFIRMED
    ).exists()

    return Response({
        'message': 'Review added successfully',
        'review': ReviewSerializer(review).data,
        'hasBooked': has_booked
    }, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_review(request, id):
    """
    Delete a review (allowed for review author or admin).
    Recalculates the turf's average rating upon deletion.
    """
    review = get_object_or_404(Review, pk=id)

    if review.user_id != request.user.id and request.user.role != User.Role.ADMIN:
        return error_response('Not authorized to delete this review', 403)

    turf = review.turf
    review.delete()

    # Recalculate average rating for the turf
    avg_rating = Review.objects.filter(turf=turf).aggregate(val=Avg('rating'))['val'] or 0
    turf.rating = avg_rating
    turf.save(update_fields=['rating'])

    return Response({'message': 'Review deleted successfully'})
