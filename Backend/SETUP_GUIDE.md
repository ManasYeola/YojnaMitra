# 🚀 Quick Setup Guide - YojnaMitra Backend

Get your backend running in 5 minutes!

## ✅ Prerequisites

- [x] Node.js 18+ installed
- [x] MongoDB Atlas account (free tier)
- [x] Code editor (VS Code recommended)
- [x] Terminal/Command Prompt

---

## 📝 Step-by-Step Setup

### Step 1: Install Dependencies ⏱️ ~2 minutes

Open terminal in the `Backend` folder:

```powershell
cd a:\WebDev\YojnaMitra\Backend
npm install
```

Wait for all packages to install...

---

### Step 2: MongoDB Atlas Setup ⏱️ ~3 minutes

#### 2.1 Create Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Log in
3. Click **"Build a Database"**
4. Choose **"M0 Free"** tier
5. Select **AWS** and nearest region
6. Cluster Name: `Cluster0` (default is fine)
7. Click **"Create"**

⏳ Wait 2-3 minutes for cluster to deploy...

#### 2.2 Create Database User

1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Username: `yojnamitra`
4. Password: Generate secure password (SAVE THIS!)
5. Select **"Read and write to any database"**
6. Click **"Add User"**

#### 2.3 Allow Network Access

1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

#### 2.4 Get Connection String

1. Click **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string

Example:
```
mongodb+srv://yojnamitra:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

### Step 3: Configure Environment Variables

1. Copy the example file:
```powershell
Copy-Item .env.example .env
```

2. Open `.env` file in your editor

3. Update these values:

```env
# Replace with your MongoDB connection string
# Replace <password> with your actual password
# Add /yojnamitra before ?retryWrites
MONGODB_URI=mongodb+srv://yojnamitra:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/yojnamitra?retryWrites=true&w=majority

# Generate a strong random string (or keep default for dev)
JWT_SECRET=my-super-secret-jwt-key-for-hackathon-2026

# Other settings (can keep defaults)
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Example MONGODB_URI**:
```
mongodb+srv://yojnamitra:MyPassword123@cluster0.abc123.mongodb.net/yojnamitra?retryWrites=true&w=majority
```

---

### Step 4: Seed Database with Schemes

```powershell
npm run seed
```

**Expected Output**:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
📊 Database: yojnamitra
🌱 Seeding database with schemes...
✅ Cleared existing schemes
✅ Successfully seeded 8 schemes

📊 Schemes by category:
   - insurance: 1
   - subsidy: 3
   - loan: 2
   - training: 1
   - equipment: 1

✨ Seeding completed successfully!
```

---

### Step 5: Start Development Server

```powershell
npm run dev
```

**Expected Output**:
```
🚀 Server is running on port 5000
📍 Environment: development
🌐 URL: http://localhost:5000
💚 Health check: http://localhost:5000/health
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
📊 Database: yojnamitra

📚 API Endpoints:
   - Auth: http://localhost:5000/api/auth
   - Schemes: http://localhost:5000/api/schemes
   - Applications: http://localhost:5000/api/applications
   - Documents: http://localhost:5000/api/documents

✨ Ready to serve requests!
```

---

## 🧪 Test Your Setup

### Test 1: Health Check

Open browser or use curl:
```powershell
curl http://localhost:5000/health
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2026-02-20T10:30:00.000Z",
  "uptime": 123.456
}
```

### Test 2: Get All Schemes

```powershell
curl http://localhost:5000/api/schemes
```

**Expected**: JSON with 8 schemes

---

## 🎯 Next Steps

### Test Authentication Flow

1. **Send OTP**:
```powershell
curl -X POST http://localhost:5000/api/auth/send-otp -H "Content-Type: application/json" -d '{\"phone\":\"9876543210\"}'
```

2. **Check Console** for OTP (printed in development mode):
```
📱 Sending OTP to 9876543210: 123456
```

3. **Verify OTP**:
```powershell
curl -X POST http://localhost:5000/api/auth/verify-otp -H "Content-Type: application/json" -d '{\"phone\":\"9876543210\",\"otp\":\"123456\",\"userData\":{\"name\":\"Ramesh Kumar\",\"state\":\"Maharashtra\",\"district\":\"Pune\",\"landSize\":3.5,\"cropType\":\"wheat\",\"farmerCategory\":\"small\"}}'
```

**You'll get a JWT token** - save it for authenticated requests!

---

## 🛠️ Development Tools

### Recommended VS Code Extensions

- REST Client
- Thunder Client
- MongoDB for VS Code

### Using Thunder Client (VS Code Extension)

1. Install Thunder Client extension
2. Create new request
3. Import collection from `API_TESTING.md`

### Using Postman

1. Download Postman
2. Create workspace "YojnaMitra"
3. Follow examples in `API_TESTING.md`

---

## 🐛 Troubleshooting

### Error: "Cannot connect to MongoDB"

**Check**:
- MongoDB Atlas cluster is running (not paused)
- Connection string is correct in `.env`
- Password doesn't have special characters (or is URL encoded)
- IP address is whitelisted (0.0.0.0/0)

**Test Connection**:
Open MongoDB Compass and paste your connection string

---

### Error: "Port 5000 already in use"

**Solution**: Change port in `.env`:
```env
PORT=5001
```

---

### Error: "Module not found"

**Solution**: Reinstall dependencies:
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

### OTP Not Receiving

**Note**: In development mode, OTP is **logged to console**, not sent via SMS.

Look for this in terminal:
```
✅ [DEV MODE] OTP for 9876543210: 123456
```

For production SMS integration, configure Twilio/MSG91 in `src/utils/otpService.ts`

---

## 📁 Project Structure Overview

```
Backend/
├── src/
│   ├── server.ts              # 🔑 Main entry point
│   ├── config/
│   │   └── database.ts        # MongoDB connection
│   ├── models/                # Database schemas
│   ├── controllers/           # Business logic
│   ├── routes/                # API endpoints
│   ├── middleware/            # Auth, validation
│   ├── utils/                 # JWT, OTP helpers
│   └── scripts/
│       └── seedSchemes.ts     # Database seeder
├── .env                       # 🔑 Environment variables
├── package.json
└── README.md
```

---

## 🚢 Deployment (Optional)

### Deploy to Railway (Fastest)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Add environment variable: `MONGODB_URI`
6. Railway auto-deploys!

**Your API URL**: `https://yojnamitra-backend.railway.app`

---

### Deploy to Render (Free Tier)

1. Go to https://render.com
2. Sign up
3. Click **"New +"** → **"Web Service"**
4. Connect GitHub
5. Build Command: `npm install && npm run build`
6. Start Command: `npm start`
7. Add environment variables
8. Deploy!

---

## ✅ Setup Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] IP whitelisted (0.0.0.0/0)
- [ ] Connection string copied
- [ ] `.env` file configured
- [ ] Database seeded (`npm run seed`)
- [ ] Server running (`npm run dev`)
- [ ] Health check successful
- [ ] Test authentication flow

---

## 🆘 Need Help?

### Check Logs
- MongoDB connection errors show in terminal
- All API requests logged with morgan

### Common Commands

```powershell
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Seed database
npm run seed

# Build for production
npm run build

# Start production server
npm start

# Check for errors (TypeScript)
npx tsc --noEmit
```

---

## 📚 Documentation

- **API Testing Guide**: See `API_TESTING.md`
- **Full README**: See `README.md`
- **MongoDB Docs**: https://docs.mongodb.com/
- **Express Docs**: https://expressjs.com/

---

## 🎉 You're All Set!

Your backend is now running and ready to connect with the frontend!

**API Base URL**: `http://localhost:5000`

**Next**: Integrate with your React frontend by updating API endpoint URLs.

---

**Built for YojnaMitra Hackathon 🏆**
