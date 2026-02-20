import { Router } from 'express';
import {
  createApplication,
  getUserApplications,
  getApplicationById,
  updateApplicationStatus,
  getAllApplications,
  deleteApplication,
} from '../controllers/application.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// All routes are protected
router.use(authenticateToken);

// User routes
router.post(
  '/',
  validate([
    body('schemeId').notEmpty().withMessage('Scheme ID is required'),
  ]),
  createApplication
);

router.get('/', getUserApplications);
router.get('/:id', getApplicationById);
router.delete('/:id', deleteApplication);

// Admin routes
router.get('/admin/all', getAllApplications);
router.patch(
  '/:id/status',
  validate([
    body('status')
      .isIn(['pending', 'approved', 'rejected', 'under-review'])
      .withMessage('Invalid status value'),
  ]),
  updateApplicationStatus
);

export default router;
