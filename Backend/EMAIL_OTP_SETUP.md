# 📧 Email OTP Setup Guide - 100% FREE!

## ✅ Why Email OTP?

**Advantages:**
- ✅ **Completely FREE** - No SMS charges!
- ✅ **Works Worldwide** - No geographic restrictions
- ✅ **Easy Setup** - 5 minutes to configure
- ✅ **Professional** - Beautiful HTML email templates included
- ✅ **Reliable** - Gmail/Outlook infrastructure

**vs SMS:**
- ❌ SMS requires payment (₹0.15-0.25 per OTP)
- ❌ SMS needs DLT approval in India
- ❌ SMS limited to one country

---

## 🚀 Quick Setup (Gmail - Recommended)

### Step 1: Create/Use Gmail Account

Use any Gmail account (can be a new one for your project).

### Step 2: Enable 2-Step Verification

1. Go to: https://myaccount.google.com/security
2. Click **2-Step Verification** → **Get Started**
3. Follow the steps to enable it

### Step 3: Create App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → Type: "YojnaMitra"
4. Click **Generate**
5. **Copy the 16-character password** (you'll need this)

### Step 4: Update .env File

Open `Backend/.env` and add:

```env
# Email Configuration (FREE!)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# Keep development mode
NODE_ENV=development
```

**Example:**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=yojnamitra@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### Step 5: Update User Model Field

Add `email` to user registration data (already implemented in code).

### Step 6: Restart Server

```bash
cd Backend
npm run dev
```

---

## 📱 Using Email OTP

### Frontend Changes Required:

**Registration Form - Add Email Field:**

```tsx
// In SignUpPage.tsx or AuthPage.tsx
const [userData, setUserData] = useState({
  name: '',
  phone: '',
  email: '', // ADD THIS
  state: '',
  district: '',
  landSize: 0,
  cropType: '',
  farmerCategory: 'small'
});

// Add email input field
<input
  type="email"
  placeholder="Email Address"
  value={userData.email}
  onChange={(e) => setUserData({...userData, email: e.target.value})}
  required
/>
```

### Backend API (Already Implemented):

**Send OTP to Email:**
```bash
POST /api/auth/send-otp
Body: {
  "email": "farmer@example.com"
}
```

**Verify Email OTP:**
```bash
POST /api/auth/verify-otp
Body: {
  "email": "farmer@example.com",
  "otp": "123456",
  "userData": {
    "name": "Farmer Name",
    "phone": "9876543210",
    "email": "farmer@example.com",
    "state": "Maharashtra",
    "district": "Pune",
    "landSize": 5.5,
    "cropType": "wheat",
    "farmerCategory": "small"
  }
}
```

---

## 🎨 Email Template Preview

Your users will receive a beautiful, professional email with:

- 🌾 **YojnaMitra Branding**
- 🔐 **Large OTP Display**
- ⏰ **10-minute Validity**
- ⚠️ **Security Warning**
- 📱 **Mobile-Responsive Design**

---

## 🔧 Alternative Email Providers

### Option 1: Outlook/Hotmail (Free)

```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-outlook-password
```

**No app password needed** - use your regular password!

### Option 2: Custom SMTP

```env
EMAIL_SERVICE=
EMAIL_HOST=smtp.yourprovider.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
```

Update `emailService.ts` to use custom SMTP:
```typescript
return nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
});
```

---

## 🧪 Testing

### Development Mode (Current):

```bash
# .env
NODE_ENV=development
```

**Behavior:** OTP logs to console
```
✅ [DEV MODE] OTP for farmer@example.com: 123456
```

### Production Mode (With Email):

```bash
# .env
NODE_ENV=production
EMAIL_USER=yojnamitra@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Behavior:** Actual email sent to user's inbox

---

## 🎯 Implementation Checklist

### Backend (Already Done ✅):
- ✅ Email service created (`emailService.ts`)
- ✅ User model updated with `email` field
- ✅ OTP model supports email
- ✅ Email OTP functions added
- ✅ Beautiful HTML email template included
- ✅ Nodemailer installed

### Frontend (Need to Update):
- ⬜ Add email input field to registration form
- ⬜ Update `userData` state to include email
- ⬜ Send email in OTP request
- ⬜ Update API calls to use email

### Configuration (Your Task):
- ⬜ Create Gmail app password
- ⬜ Update `.env` file with credentials
- ⬜ Test with your email address

---

## 📊 Comparison: Email vs SMS

| Feature | Email OTP | SMS OTP |
|---------|-----------|---------|
| **Cost** | FREE ✅ | ₹0.15-0.25/OTP ❌ |
| **Setup Time** | 5 minutes ✅ | 1-2 days (DLT approval) ❌ |
| **Approval Required** | No ✅ | Yes (DLT in India) ❌ |
| **Geographic Limit** | None ✅ | Country-specific ❌ |
| **Design** | Beautiful HTML ✅ | Plain text ❌ |
| **Speed** | Instant ✅ | 1-5 seconds ✅ |
| **Professional** | Very ✅ | Basic ✅ |

---

## 🚨 Common Issues & Fixes

### Issue 1: "Invalid credentials"
**Fix:** Ensure you're using an **App Password**, not your regular Gmail password.

### Issue 2: "Less secure app access"
**Fix:** Use App Password instead. Google no longer allows regular passwords for SMTP.

### Issue 3: Emails going to spam
**Fix:** 
- Use a verified Gmail account
- Add SPF/DKIM records (for custom domains)
- In development, check spam folder

### Issue 4: "Connection timeout"
**Fix:** 
- Check your internet connection
- Ensure port 587 is not blocked by firewall
- Try port 465 with `secure: true`

---

## 💡 Pro Tips

1. **Use a Dedicated Email:**
   Create `noreply@yojnamitra.com` or `otp@yojnamitra.com`

2. **Track Emails:**
   Gmail free tier allows **500 emails/day** (plenty for OTP)

3. **Add Welcome Email:**
   Already implemented! Users get welcome email after registration.

4. **Customize Template:**
   Edit `emailService.ts` to match your branding

5. **Monitor Usage:**
   Check Gmail's sent folder to track OTP emails

---

## 🔐 Security Best Practices

1. ✅ **Never commit .env** - Already in .gitignore
2. ✅ **Use App Passwords** - Not regular passwords
3. ✅ **10-minute OTP expiry** - Already implemented
4. ✅ **5 attempt limit** - Already implemented
5. ✅ **One-time use** - OTPs marked as used after verification

---

## 🎓 For Your Team

**Share these credentials securely:**

```env
# DO NOT COMMIT TO GIT!
# Share via secure channel (LastPass, 1Password, etc.)

EMAIL_SERVICE=gmail
EMAIL_USER=yojnamitra@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

---

## 📱 Both Phone & Email Support

**Want both?** You can support both authentication methods:

```typescript
// Send OTP based on user preference
if (email) {
  await sendEmailOTP(email);
} else if (phone) {
  await sendSMSOTP(phone);
}
```

Already implemented in backend! Just add UI toggle in frontend.

---

## ✅ Quick Start Commands

```bash
# 1. Ensure nodemailer is installed (already done)
npm list nodemailer @types/nodemailer

# 2. Update .env with Gmail credentials
nano .env  # or use VS Code

# 3. Restart server
npm run dev

# 4. Test with your email
# Use Postman or frontend to send OTP
```

---

## 📞 Support

**Email working?** ✅ You're all set!

**Still having issues?**
1. Check `.env` configuration
2. Verify App Password is correct
3. Ensure 2-Step Verification is enabled
4. Check console for error messages

---

## 🎉 Benefits of Our Implementation

- ✅ **Production-Ready** email templates
- ✅ **Mobile-Responsive** design
- ✅ **Fallback Mode** - logs OTP if email fails
- ✅ **Welcome Emails** - professional first impression
- ✅ **Zero Cost** - completely free to run
- ✅ **Scalable** - Gmail handles infrastructure

---

## 🚀 Ready to Go!

1. Create Gmail App Password (2 minutes)
2. Update `.env` file (1 minute)
3. Add email field to frontend form (5 minutes)
4. Test with your email (1 minute)

**Total: 9 minutes to FREE OTP! 🎊**

---

## 📖 Code Already Implemented

### Email Service: `src/utils/emailService.ts`
- ✅ Beautiful HTML template
- ✅ Development/Production modes
- ✅ Fallback logging
- ✅ Welcome emails

### OTP Service: `src/utils/otpService.ts`
- ✅ `saveEmailOTP()` function
- ✅ `verifyEmailOTP()` function
- ✅ Email support in OTP model

### User Model: `src/models/User.ts`
- ✅ Email field added
- ✅ Email validation
- ✅ Email verification tracking

**Everything is ready! Just add your Gmail credentials!** 🚀
