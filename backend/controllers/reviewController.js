import prisma from '../config/db.js';

// Helper to recalculate and update turf rating average
const updateTurfRating = async (turfId) => {
  const reviews = await prisma.review.findMany({
    where: { turfId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    await prisma.turf.update({
      where: { id: turfId },
      data: { rating: 0.0 },
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));

  await prisma.turf.update({
    where: { id: turfId },
    data: { rating: averageRating },
  });
};

// @desc    Add review for a turf
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { turfId, rating, comment } = req.body;
    const userId = req.user.id;

    const turf = await prisma.turf.findUnique({
      where: { id: turfId },
      select: { id: true },
    });

    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    // Check if user has bookings for this turf (premium trust filter)
    const bookings = await prisma.booking.findFirst({
      where: {
        userId,
        turfId,
        bookingStatus: 'CONFIRMED',
      },
    });

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        turfId,
        rating: parseInt(rating),
        comment,
      },
      include: {
        user: { select: { name: true, profileImage: true } },
      },
    });

    // Update global turf rating average
    await updateTurfRating(turfId);

    res.status(201).json({
      message: 'Review added successfully',
      review,
      hasBooked: !!bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Auth verification: Author of review or Admin
    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await prisma.review.delete({ where: { id } });

    // Update global turf rating average
    await updateTurfRating(review.turfId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export {
  createReview,
  deleteReview,
};
