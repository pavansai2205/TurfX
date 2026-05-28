import prisma from '../config/db.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// @desc    Initiate Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { turf: true },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized transaction initiate request' });
    }

    if (booking.paymentStatus === 'PAID') {
      return res.status(400).json({ message: 'This booking has already been paid.' });
    }

    // Check if keys are configured
    const hasKeys = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
    if (!hasKeys || process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder') {
      return res.status(400).json({ 
        message: 'Razorpay Payment Gateway is not active. Real credentials must be supplied in backend/.env' 
      });
    }

    // Razorpay orders amount is represented in Paisa (INR * 100)
    const amountInPaisa = Math.round(booking.totalPrice * 100);

    try {
      const rzpInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const order = await rzpInstance.orders.create({
        amount: amountInPaisa,
        currency: 'INR',
        receipt: booking.id,
        payment_capture: 1,
      });

      return res.json({
        success: true,
        orderId: order.id,
        amount: booking.totalPrice,
        currency: 'INR',
        bookingId: booking.id,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch (err) {
      return res.status(500).json({ 
        message: `Razorpay Order initialization failed: ${err.message}` 
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature & confirm booking
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ 
        message: 'Missing transaction parameters (razorpayOrderId, razorpayPaymentId, and razorpaySignature are required)' 
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking associated with payment not found' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized payment verification request' });
    }

    if (booking.paymentStatus === 'PAID' && booking.bookingStatus === 'CONFIRMED') {
      const existingPayment = await prisma.payment.findFirst({
        where: { bookingId },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({
        success: true,
        message: 'Payment was already verified for this booking.',
        booking,
        payment: existingPayment,
      });
    }

    if (booking.bookingStatus === 'CANCELLED') {
      return res.status(400).json({ message: 'Cancelled bookings cannot be paid.' });
    }

    const hasKeys = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
    if (!hasKeys || process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder') {
      return res.status(400).json({ 
        message: 'Razorpay keys are not configured. Cannot verify cryptographic signature.' 
      });
    }

    // Cryptographic verification
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      // Mark booking as cancelled or failed
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          bookingStatus: 'CANCELLED',
          paymentStatus: 'FAILED',
        },
      });
      return res.status(400).json({ success: false, message: 'Invalid payment signature validation' });
    }

    // Complete transaction inside Database transaction
    const updateResult = await prisma.$transaction(async (tx) => {
      // Update booking
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          bookingStatus: 'CONFIRMED',
          paymentStatus: 'PAID',
        },
        include: { slot: true, turf: true },
      });

      // Create payment log
      const paymentLog = await tx.payment.create({
        data: {
          bookingId,
          razorpayOrderId,
          razorpayPaymentId,
          amount: booking.totalPrice,
          paymentStatus: 'PAID',
        },
      });

      return { updatedBooking, paymentLog };
    });

    res.json({
      success: true,
      message: 'Payment verification completed. Booking confirmed.',
      booking: updateResult.updatedBooking,
      payment: updateResult.paymentLog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download payment receipt / invoice details
// @route   GET /api/payments/receipt/:bookingId
// @access  Private
const getReceipt = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        turf: true,
        slot: true,
        payments: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking invoice not found' });
    }

    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN' && booking.turf.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized receipt access' });
    }

    res.json({
      receiptId: `REC-${booking.id.substring(0, 8).toUpperCase()}`,
      bookingDate: booking.bookingDate.toISOString().split('T')[0],
      createdAt: booking.createdAt,
      customer: {
        name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone,
      },
      item: {
        turfName: booking.turf.name,
        address: booking.turf.address,
        location: booking.turf.location,
        timings: `${booking.slot.startTime} - ${booking.slot.endTime}`,
      },
      payment: {
        totalPrice: booking.totalPrice,
        status: booking.paymentStatus,
        details: booking.payments[0] || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export {
  createRazorpayOrder,
  verifyPayment,
  getReceipt,
};
