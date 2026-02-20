import nodemailer from 'nodemailer';

// Email transporter configuration
const createTransporter = () => {
  // Check if email service is configured
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailService = process.env.EMAIL_SERVICE || 'gmail';

  if (!emailUser || !emailPassword) {
    console.warn('⚠️  Email service not configured. Using development mode.');
    return null;
  }

  // Create transporter
  return nodemailer.createTransport({
    service: emailService,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
};

// Send OTP via Email
export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  try {
    // Development mode - log to console
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
      return true;
    }

    // Production mode - send actual email
    const transporter = createTransporter();

    if (!transporter) {
      console.error('Email service not configured. Check .env file.');
      console.log(`[FALLBACK] OTP for ${email}: ${otp}`);
      return true; // Return true to not block registration
    }

    // Email content
    const mailOptions = {
      from: `"YojnaMitra" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your YojnaMitra Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌾 YojnaMitra</h1>
              <p>Your Partner in Farming Success</p>
            </div>
            <div class="content">
              <h2>Hello Farmer! 👨‍🌾</h2>
              <p>Thank you for registering with YojnaMitra. We're excited to help you access government schemes and benefits.</p>
              
              <div class="otp-box">
                <p>Your verification code is:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin-top: 15px; color: #666;">Valid for 10 minutes</p>
              </div>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong> Never share this code with anyone. YojnaMitra will never ask for your OTP via phone or email.
              </div>

              <p>If you didn't request this code, please ignore this email.</p>

              <div class="footer">
                <p>© 2026 YojnaMitra. Empowering Indian Farmers.</p>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Your YojnaMitra verification code is: ${otp}\n\nThis code is valid for 10 minutes.\n\nNever share this code with anyone.\n\nIf you didn't request this code, please ignore this email.`,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}. Message ID: ${info.messageId}`);
    return true;

  } catch (error) {
    console.error('Error sending OTP email:', error);
    // In case of error, log OTP so registration can continue
    console.log(`[FALLBACK] OTP for ${email}: ${otp}`);
    return true;
  }
};

// Send welcome email after successful registration
export const sendWelcomeEmail = async (email: string, name: string): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    if (!transporter || process.env.NODE_ENV !== 'production') {
      return true;
    }

    const mailOptions = {
      from: `"YojnaMitra" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to YojnaMitra! 🌾',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature-box { background: white; border-radius: 8px; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to YojnaMitra!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}! 👨‍🌾</h2>
              <p>Congratulations on joining YojnaMitra! We're thrilled to have you in our community of empowered farmers.</p>
              
              <h3>What You Can Do:</h3>
              
              <div class="feature-box">
                <strong>🔍 Discover Schemes</strong><br>
                Browse 8+ government schemes tailored for farmers like you.
              </div>
              
              <div class="feature-box">
                <strong>🎯 Get Recommendations</strong><br>
                Receive personalized scheme recommendations based on your profile.
              </div>
              
              <div class="feature-box">
                <strong>📝 Apply Online</strong><br>
                Submit applications directly through our platform.
              </div>
              
              <div class="feature-box">
                <strong>📊 Track Applications</strong><br>
                Monitor your application status in real-time.
              </div>

              <p style="margin-top: 30px;">Ready to get started? Log in to explore schemes that match your farming profile!</p>

              <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
                <p>© 2026 YojnaMitra. Empowering Indian Farmers.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
    return true;

  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return false;
  }
};
