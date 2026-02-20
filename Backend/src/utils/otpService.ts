import OTP from '../models/OTP';

// Generate 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP to database
export const saveOTP = async (phone: string): Promise<string> => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Invalidate any existing OTPs for this phone
  await OTP.updateMany(
    { phone, isUsed: false },
    { isUsed: true }
  );

  // Create new OTP
  await OTP.create({
    phone,
    otp,
    expiresAt,
    isUsed: false,
    attempts: 0,
  });

  return otp;
};

// Verify OTP
export const verifyOTP = async (phone: string, otp: string): Promise<boolean> => {
  const otpRecord = await OTP.findOne({
    phone,
    otp,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!otpRecord) {
    return false;
  }

  // Check attempts
  if (otpRecord.attempts >= 5) {
    return false;
  }

  // Increment attempts
  otpRecord.attempts += 1;

  // If OTP matches, mark as used
  if (otpRecord.otp === otp) {
    otpRecord.isUsed = true;
    await otpRecord.save();
    return true;
  }

  await otpRecord.save();
  return false;
};

// Send OTP via SMS (Mock implementation)
// Replace with actual Twilio/MSG91 implementation
export const sendOTP = async (phone: string, otp: string): Promise<boolean> => {
  try {
    console.log(`📱 Sending OTP to ${phone}: ${otp}`);
    
    // TODO: Implement actual SMS service
    // Example with Twilio:
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({
    //   body: `Your YojnaMitra verification code is: ${otp}. Valid for 10 minutes.`,
    //   from: twilioPhoneNumber,
    //   to: `+91${phone}`
    // });

    // For development, just log the OTP
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [DEV MODE] OTP for ${phone}: ${otp}`);
      return true;
    }

    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
};

// Cleanup expired OTPs (optional, as TTL index handles this)
export const cleanupExpiredOTPs = async (): Promise<void> => {
  await OTP.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};
