import twilio from 'twilio';

// Lazy client — only instantiated when actually sending a message.
// This prevents a crash at startup when Twilio credentials are not yet configured.
let _client: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (!_client) {
    const sid   = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !sid.startsWith('AC') || !token) {
      throw new Error(
        'Twilio not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env'
      );
    }
    _client = twilio(sid, token);
  }
  return _client;
}

/**
 * Send a plain text WhatsApp message via Twilio.
 * `to` should be the raw phone number, e.g. "919876543210"
 */
export const sendWhatsAppMessage = async (to: string, body: string): Promise<void> => {
  const from = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
  await getClient().messages.create({
    from,
    to: `whatsapp:+${to}`,
    body,
  });
};
