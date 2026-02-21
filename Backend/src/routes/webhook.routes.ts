import { Router } from 'express';
import { handleWhatsappWebhook } from '../controllers/webhook.controller';

const router = Router();

// Twilio POSTs here on every incoming WhatsApp message
router.post('/whatsapp', handleWhatsappWebhook);

export default router;
