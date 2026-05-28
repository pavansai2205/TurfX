import { check, validationResult } from 'express-validator';

// Error checker helper
const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Auth Validations
const validateRegister = [
  check('name', 'Name is required').notEmpty().trim(),
  check('email', 'Please provide a valid email').isEmail().normalizeEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('phone', 'Please provide a valid phone number').notEmpty().trim(),
  check('role', 'Invalid role provided').optional().isIn(['USER', 'TURF_OWNER', 'ADMIN']),
  validateFields,
];

const validateLogin = [
  check('email', 'Please provide a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').notEmpty(),
  validateFields,
];

// Turf Validations
const validateTurf = [
  check('name', 'Turf name is required').notEmpty().trim(),
  check('description', 'Description is required').notEmpty().trim(),
  check('location', 'Location city is required').notEmpty().trim(),
  check('address', 'Full address is required').notEmpty().trim(),
  check('pricePerHour', 'Price per hour must be a positive number').isFloat({ min: 0.1 }),
  check('amenities', 'Amenities must be provided as an array').isArray(),
  validateFields,
];

// Booking Validations
const validateBooking = [
  check('turfId', 'Invalid turf ID format').isUUID(),
  check('slotId', 'Invalid slot ID format').isUUID(),
  check('bookingDate', 'Please provide a valid ISO date').isISO8601(),
  validateFields,
];

// Review Validations
const validateReview = [
  check('turfId', 'Invalid turf ID format').isUUID(),
  check('rating', 'Rating must be an integer between 1 and 5').isInt({ min: 1, max: 5 }),
  check('comment', 'Comment text is required').notEmpty().trim(),
  validateFields,
];

export {
  validateRegister,
  validateLogin,
  validateTurf,
  validateBooking,
  validateReview,
};
