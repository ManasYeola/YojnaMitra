import { Router } from 'express';
import { getSession, createSession } from '../controllers/session.controller';

const router = Router();

// POST /api/session/create — manually create a session (bypasses WhatsApp, for testing)
router.post('/create', createSession);

// GET /api/session/:token — fetch eligible schemes for a session token
router.get('/:token', getSession);

export default router;
