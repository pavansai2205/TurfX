import express from 'express';
const router = express.Router();
import { updateProfile, changePassword } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
