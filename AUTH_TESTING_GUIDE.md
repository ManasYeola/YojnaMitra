# Authentication Testing Guide

## ✅ What Was Created

### New Components
- **AuthPage.tsx** - Complete login/signup flow with OTP
- **AuthPage.css** - Styled authentication pages

### Updated Components
- **App.tsx** - Added authentication state management
- **LandingPage.tsx** - Working Sign In button

## 🔐 Authentication Flow

### Step 1: Phone Number Entry
- User enters 10-digit phone number
- Clicks "Send OTP"
- OTP is sent (check console in dev mode)

### Step 2: OTP Verification
- User enters 6-digit OTP
- System verifies OTP
- Checks if user profile is complete

### Step 3A: New User Registration
If profile incomplete, user fills:
- Full Name (required)
- Age (optional)
- State (required)
- District (required)
- Land Size in acres (required)
- Farmer Category (required)
  - Marginal (<2.5 acres)
  - Small (2.5-5 acres)
  - Large (>5 acres)
- Primary Crop Type (required)

### Step 3B: Existing User
- User is directly logged in to dashboard
- Profile data is loaded from backend

## 🧪 Testing Steps

### 1. Start Backend Server
```bash
cd Backend
npm run dev
```
Expected output: `Server running on port 5000`

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```
Expected output: `Local: http://localhost:5173`

### 3. Test Authentication

#### a) Test New User Registration
1. Click "Sign In" on landing page
2. Enter phone: `9876543210`
3. Click "Send OTP"
4. Check backend console for OTP (since OTP_SERVICE=console)
5. Enter the OTP shown in backend console
6. Fill registration form with:
   - Name: Test Farmer
   - State: Maharashtra
   - District: Pune
   - Land Size: 5
   - Category: Small
   - Crop: Wheat
7. Click "Complete Registration"
8. Should redirect to dashboard

#### b) Test Existing User Login
1. Use same phone number: `9876543210`
2. Click "Send OTP"
3. Enter OTP from backend console
4. Should directly go to dashboard (no registration form)

#### c) Test Invalid OTP
1. Enter wrong OTP
2. Should show error message
3. Try again with correct OTP

### 4. Test Sign In Button
- Click "Sign In" in navbar
- Should navigate to AuthPage
- Click "← Back to Home"
- Should return to landing page

## 📝 Backend OTP Configuration

In development mode, OTP is printed to backend console:

```
OTP_SERVICE=console
```

Check backend terminal for output like:
```
[OTP] Phone: 9876543210, OTP: 123456
```

## 🔧 Troubleshooting

### Issue: OTP not received
**Solution**: Check backend console for OTP (development mode)

### Issue: "Failed to send OTP"
**Solution**: 
- Ensure backend is running on port 5000
- Check backend console for errors
- Verify MongoDB connection

### Issue: "Invalid OTP"
**Solution**:
- OTP expires in 10 minutes
- Maximum 5 attempts per OTP
- Request new OTP if expired

### Issue: Sign In button not working
**Solution**:
- Clear browser cache
- Check browser console for errors
- Verify frontend is connected to backend (check .env file)

## 🌐 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
OTP_SERVICE=console
```

## 🎯 Expected Behavior

1. **Landing Page** → "Sign In" button opens AuthPage
2. **AuthPage** → Phone → OTP → Registration (new user) or Dashboard (existing user)
3. **Dashboard** → Logout → Landing Page
4. **Persistent Login** → Refresh page → Still logged in (JWT token)

## 📱 User Data Storage

- **Token**: Stored in `localStorage` as `authToken`
- **User**: Stored in `localStorage` as `user` (JSON)
- **Auto-clear**: On logout or 401 error

## 🔐 Security Features

- ✅ JWT token authentication
- ✅ OTP verification (6 digits)
- ✅ Token expiry (7 days)
- ✅ Automatic logout on 401
- ✅ Input validation (phone, OTP, profile fields)
- ✅ Protected routes (requires authentication)

## 🚀 Next Steps

1. ✅ Test phone OTP flow
2. ✅ Test registration form
3. ✅ Test existing user login
4. ⏳ Integrate real SMS service (Twilio/MSG91)
5. ⏳ Build scheme browsing pages
6. ⏳ Build application tracking
7. ⏳ Build document upload

Happy Testing! 🎉
