import { Router } from 'express';
import {
  getAllSchemes,
  getSchemeById,
  getRecommendedSchemes,
  createScheme,
  updateScheme,
  deleteScheme,
  checkSchemeEligibility,
  getEligibleSchemesForUser,
  checkEligibilityBatch,
} from '../controllers/scheme.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Public routes
router.get('/', getAllSchemes);

// Eligibility routes (specific routes before /:id)
router.get('/eligible', authenticateToken, getEligibleSchemesForUser);
router.post('/check-eligibility-batch', checkEligibilityBatch);
router.post('/:id/check-eligibility', checkSchemeEligibility);

// Regular scheme routes
router.get('/:id', getSchemeById);

// Protected routes
router.get('/user/recommended', authenticateToken, getRecommendedSchemes);

// Admin routes (you can add admin middleware later)
router.post(
  '/',
  validate([
    body('name').notEmpty().withMessage('Scheme name is required'),
    body('category')
      .isIn(['insurance', 'subsidy', 'loan', 'training', 'equipment'])
      .withMessage('Invalid category'),
    body('description').notEmpty().withMessage('Description is required'),
    body('benefits').isArray({ min: 1 }).withMessage('At least one benefit is required'),
    body('documents').isArray({ min: 1 }).withMessage('At least one document is required'),
  ]),
  createScheme
);

router.patch('/:id', updateScheme);
router.delete('/:id', deleteScheme);

export default router;
