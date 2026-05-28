import express from 'express';
const router = express.Router();
import { createReview, deleteReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import { validateReview } from '../middleware/validator.js';

router.post('/', protect, validateReview, createReview);
router.delete('/:id', protect, deleteReview);

export default router;
