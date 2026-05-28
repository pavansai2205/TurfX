import express from 'express';
const router = express.Router();
import {
  createRazorpayOrder,
  verifyPayment,
  getReceipt,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.get('/receipt/:bookingId', protect, getReceipt);

export default router;
