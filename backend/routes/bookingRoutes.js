import express from 'express';
const router = express.Router();
import {
  checkAvailability,
  createBooking,
  getMyBookings,
  getOwnerBookings,
  cancelBooking,
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';
import { validateBooking } from '../middleware/validator.js';

router.get('/availability', checkAvailability);

router.post('/', protect, validateBooking, createBooking);
router.get('/my-history', protect, getMyBookings);
router.get('/owner-ledgers', protect, authorizeRoles('TURF_OWNER', 'ADMIN'), getOwnerBookings);

router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/status', protect, authorizeRoles('TURF_OWNER', 'ADMIN'), updateBookingStatus);

export default router;
