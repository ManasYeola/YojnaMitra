import OTP from '../models/OTP';
import axios from 'axios';

// Generate 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP to database (Phone)
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

// Save OTP to database (Email)
export const saveEmailOTP = async (email: string): Promise<string> => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Invalidate any existing OTPs for this email
  await OTP.updateMany(
    { email, isUsed: false },
    { isUsed: true }
  );

  // Create new OTP
  await OTP.create({
    email,
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

// Verify OTP (Email)
export const verifyEmailOTP = async (email: string, otp: string): Promise<boolean> => {
  const otpRecord = await OTP.findOne({
    email,
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

// Send OTP via SMS
export const sendOTP = async (phone: string, otp: string): Promise<boolean> => {
  try {
    console.log(`📱 Sending OTP to ${phone}: ${otp}`);
    
    // Development mode - log to console
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ [DEV MODE] OTP for ${phone}: ${otp}`);
      return true;
    }

    // Production mode - MSG91 SMS Gateway
    const authKey = process.env.MSG91_AUTH_KEY;
    const senderId = process.env.MSG91_SENDER_ID;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !senderId || !templateId) {
      console.error('❌ MSG91 credentials not configured. Check .env file.');
      console.log(`🔧 [FALLBACK] OTP for ${phone}: ${otp}`);
      return true; // Return true to not block registration
    }

    // Send SMS via MSG91
    const url = 'https://api.msg91.com/api/v5/otp';
    
    const response = await axios.post(
      url,
      {
        template_id: templateId,
        mobile: `91${phone}`,
        authkey: authKey,
        otp: otp,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'authkey': authKey
        }
      }
    );

    if (response.data.type === 'success') {
      console.log(`✅ OTP sent successfully to ${phone} via SMS`);
      return true;
    }

    console.error('❌ MSG91 Error:', response.data);
    console.log(`🔧 [FALLBACK] OTP for ${phone}: ${otp}`);
    return true;

  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    // In case of error, log OTP so registration can continue
    console.log(`🔧 [FALLBACK] OTP for ${phone}: ${otp}`);
    return true;
  }
};

// Cleanup expired OTPs (optional, as TTL index handles this)
export const cleanupExpiredOTPs = async (): Promise<void> => {
  await OTP.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};
