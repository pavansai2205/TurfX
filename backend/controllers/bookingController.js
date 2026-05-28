import prisma from '../config/db.js';

// @desc    Check slot availability for a turf on a specific date
// @route   GET /api/bookings/availability
// @access  Public
const checkAvailability = async (req, res, next) => {
  try {
    const { turfId, date } = req.query;

    if (!turfId || !date) {
      return res.status(400).json({ message: 'Both turfId and date are required' });
    }

    // Convert date string to Date object (removing time portion)
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    // Get turf and slots
    const turf = await prisma.turf.findUnique({
      where: { id: turfId },
      include: { slots: true },
    });

    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    // Get all active bookings for this turf on this date
    const bookings = await prisma.booking.findMany({
      where: {
        turfId,
        bookingDate,
        bookingStatus: { in: ['CONFIRMED', 'PENDING'] },
      },
      select: { slotId: true },
    });

    const bookedSlotIds = new Set(bookings.map((b) => b.slotId));

    // Map slots and add dynamic isBooked property
    const slotsWithAvailability = turf.slots.map((slot) => ({
      ...slot,
      isBooked: bookedSlotIds.has(slot.id),
    }));

    res.json({
      date: bookingDate.toISOString().split('T')[0],
      pricePerHour: turf.pricePerHour,
      slots: slotsWithAvailability,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate booking and lock slot (using Prisma Transaction)
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { turfId, slotId, bookingDate } = req.body;
    const userId = req.user.id;

    if (!turfId || !slotId || !bookingDate) {
      return res.status(400).json({ message: 'Please provide turfId, slotId and bookingDate' });
    }

    // Set time portion of booking date to 0
    const targetDate = new Date(bookingDate);
    targetDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate < today) {
      return res.status(400).json({ message: 'Booking date cannot be in the past' });
    }

    // Run in database transaction to prevent race conditions (Double Bookings)
    const bookingResult = await prisma.$transaction(async (tx) => {
      // 1. Re-check slot existence
      const slot = await tx.slot.findUnique({
        where: { id: slotId },
        include: { turf: true },
      });

      if (!slot || slot.turfId !== turfId) {
        throw new Error('Selected slot is invalid or does not belong to this turf');
      }

      // 2. Lock check: See if an active booking already exists
      const existingBooking = await tx.booking.findFirst({
        where: {
          slotId,
          bookingDate: targetDate,
          bookingStatus: { in: ['CONFIRMED', 'PENDING'] },
        },
      });

      if (existingBooking) {
        throw new Error('This slot is already booked or reserved by another transaction.');
      }

      // Calculate price (single slot is 1 hour, so total is pricePerHour)
      const totalPrice = slot.turf.pricePerHour;

      // 3. Create pending booking inside transaction
      const newBooking = await tx.booking.create({
        data: {
          userId,
          turfId,
          slotId,
          bookingDate: targetDate,
          totalPrice,
          bookingStatus: 'PENDING',
          paymentStatus: 'PENDING',
        },
        include: {
          turf: true,
          slot: true,
        },
      });

      return newBooking;
    });

    res.status(201).json({
      message: 'Slot reserved successfully. Proceed to payment page.',
      booking: bookingResult,
    });
  } catch (error) {
    // Return standard validation failure codes
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get current user booking logs
// @route   GET /api/bookings/my-history
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        turf: true,
        slot: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's turf bookings
// @route   GET /api/bookings/owner-ledgers
// @access  Private (Owner/Admin)
const getOwnerBookings = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const bookings = await prisma.booking.findMany({
      where: {
        turf: { ownerId },
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        turf: true,
        slot: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { turf: true },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Auth validation: only booker, turf owner, or admin
    const isBooker = booking.userId === req.user.id;
    const isOwner = booking.turf.ownerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isBooker && !isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Update status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        bookingStatus: 'CANCELLED',
        paymentStatus: booking.paymentStatus === 'PAID' ? 'PENDING' : 'FAILED', // PENDING means refund processing if paid
      },
      include: { slot: true, turf: true },
    });

    res.json({
      message: 'Booking cancelled successfully.',
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking approval status
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner/Admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // CONFIRMED, COMPLETED, CANCELLED

    if (!['CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status code' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { turf: true },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorized check
    if (booking.turf.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to modify this booking' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        bookingStatus: status,
      },
      include: { slot: true, turf: true },
    });

    res.json({
      message: `Booking status updated to ${status} successfully.`,
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

export {
  checkAvailability,
  createBooking,
  getMyBookings,
  getOwnerBookings,
  cancelBooking,
  updateBookingStatus,
};
