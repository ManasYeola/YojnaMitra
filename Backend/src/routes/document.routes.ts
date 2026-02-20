import { Router } from 'express';
import {
  uploadDocument,
  getApplicationDocuments,
  deleteDocument,
  verifyDocument,
  upload,
} from '../controllers/document.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authenticateToken);

// User routes
router.post('/upload', upload.single('document'), uploadDocument);
router.get('/application/:applicationId', getApplicationDocuments);
router.delete('/:id', deleteDocument);

// Admin routes
router.patch('/:id/verify', verifyDocument);

export default router;
