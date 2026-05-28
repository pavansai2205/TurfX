import express from 'express';
const router = express.Router();
import { register, login, getMe, forgotPassword } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validator.js';
import { protect } from '../middleware/auth.js';

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);

export default router;
