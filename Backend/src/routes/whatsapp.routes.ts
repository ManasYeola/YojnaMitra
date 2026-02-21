import express from 'express';
import whatsappController from '../controllers/whatsapp.controller';

const router = express.Router();

/**
 * POST /api/whatsapp/webhook
 * Receives incoming WhatsApp messages from Twilio
 */
router.post('/webhook', whatsappController.handleIncomingMessage.bind(whatsappController));

/**
 * GET /api/whatsapp/health
 * Health check endpoint
 */
router.get('/health', whatsappController.healthCheck.bind(whatsappController));

export default router;
