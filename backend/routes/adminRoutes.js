import express from 'express';
const router = express.Router();
import {
  getAdminAnalytics,
  getAllUsers,
  toggleUserRole,
  deleteUser,
  getAllBookings,
} from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

// Lock all routes inside this module to Admin role only
router.use(protect, authorizeRoles('ADMIN'));

router.get('/analytics', getAdminAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/role', toggleUserRole);
router.delete('/users/:id', deleteUser);
router.get('/bookings', getAllBookings);

export default router;
