import twilio from 'twilio';

// Lazy client — only instantiated when actually sending a message.
// This prevents a crash at startup when Twilio credentials are not yet configured.
let _client: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (!_client) {
    const sid   = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from  = process.env.TWILIO_WHATSAPP_NUMBER;
    if (!sid || !sid.startsWith('AC') || !token || !from) {
      throw new Error(
        'Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_WHATSAPP_NUMBER in .env'
      );
    }
    _client = twilio(sid, token);
  }
  return _client;
}

/**
 * Convert stored phone (10-digit or 12-digit) to full E.164 format for Twilio.
 * Assumes Indian numbers if 10 digits.
 */
function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

/**
 * Send a plain text WhatsApp message via Twilio.
 * `to` can be 10-digit ("9876543210") or full international ("919876543210")
 */
export const sendWhatsAppMessage = async (to: string, body: string): Promise<void> => {
  const from = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
  await getClient().messages.create({
    from,
    to: `whatsapp:${toE164(to)}`,
    body,
  });
};
