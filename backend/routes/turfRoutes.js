import express from 'express';
const router = express.Router();
import {
  getAllTurfs,
  getTurfById,
  createTurf,
  updateTurf,
  deleteTurf,
} from '../controllers/turfController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';
import { validateTurf } from '../middleware/validator.js';

router.get('/', getAllTurfs);
router.get('/:id', getTurfById);

// Owner / Admin restricted routes
router.post('/', protect, authorizeRoles('TURF_OWNER', 'ADMIN'), validateTurf, createTurf);
router.put('/:id', protect, authorizeRoles('TURF_OWNER', 'ADMIN'), updateTurf);
router.delete('/:id', protect, authorizeRoles('TURF_OWNER', 'ADMIN'), deleteTurf);

export default router;
