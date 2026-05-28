import express from 'express';
const router = express.Router();
import { uploadImage } from '../controllers/uploadController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

// Only owners and admin can upload turf media assets to cloud storage
router.post('/', protect, authorizeRoles('TURF_OWNER', 'ADMIN'), uploadImage);

export default router;
