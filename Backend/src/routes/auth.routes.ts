import { Router } from 'express';
import {
  sendOTPController,
  verifyOTPController,
  getProfile,
  updateProfile,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Send OTP
router.post(
  '/send-otp',
  validate([
    body('phone')
      .matches(/^[0-9]{10}$/)
      .withMessage('Please provide a valid 10-digit phone number'),
  ]),
  sendOTPController
);

// Verify OTP and register/login
router.post(
  '/verify-otp',
  validate([
    body('phone')
      .matches(/^[0-9]{10}$/)
      .withMessage('Please provide a valid 10-digit phone number'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits'),
  ]),
  verifyOTPController
);

// Get user profile (Protected)
router.get('/profile', authenticateToken, getProfile);

// Update user profile (Protected)
router.patch(
  '/profile',
  authenticateToken,
  validate([
    body('name').optional().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('state').optional().notEmpty().withMessage('State cannot be empty'),
    body('district').optional().notEmpty().withMessage('District cannot be empty'),
    body('landSize').optional().isFloat({ min: 0 }).withMessage('Land size must be a positive number'),
    body('cropType').optional().notEmpty().withMessage('Crop type cannot be empty'),
    body('farmerCategory').optional().isIn(['small', 'marginal', 'large']).withMessage('Invalid farmer category'),
    body('age').optional().isInt({ min: 18, max: 120 }).withMessage('Age must be between 18 and 120'),
  ]),
  updateProfile
);

export default router;
