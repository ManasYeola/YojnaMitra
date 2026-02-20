# YojnaMitra Backend API

Backend server for YojnaMitra - A comprehensive farmer support system that helps farmers discover and apply for government schemes.

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Language**: TypeScript
- **Authentication**: JWT + OTP
- **File Upload**: Multer

## 📦 Installation

### Prerequisites

- Node.js 18 or higher
- MongoDB Atlas account
- npm or yarn

### Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**
   
   Edit `.env` file with your credentials:
   ```env
   # MongoDB Atlas Connection
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/yojnamitra

   # JWT Secret (Generate a strong random string)
   JWT_SECRET=your-super-secret-jwt-key

   # Other configurations
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

## 🗄️ Database Setup

### 1. Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Wait for cluster to be created (2-5 minutes)

### 2. Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password
5. Replace `myFirstDatabase` with `yojnamitra`

Example:
```
mongodb+srv://admin:MyPassword123@cluster0.xxxxx.mongodb.net/yojnamitra?retryWrites=true&w=majority
```

### 3. Configure Network Access

1. Go to "Network Access" in Atlas
2. Add IP: `0.0.0.0/0` (Allow from anywhere - for development)
3. For production, add specific IPs only

### 4. Seed Database

```bash
npm run seed
```

This will populate your database with 8 government schemes.

## 🚀 Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

The server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/send-otp` | Send OTP to phone | No |
| POST | `/api/auth/verify-otp` | Verify OTP & login/register | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PATCH | `/api/auth/profile` | Update user profile | Yes |

### Schemes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/schemes` | Get all schemes | No |
| GET | `/api/schemes/:id` | Get scheme by ID | No |
| GET | `/api/schemes/user/recommended` | Get recommended schemes for user | Yes |
| POST | `/api/schemes` | Create new scheme (Admin) | Yes |
| PATCH | `/api/schemes/:id` | Update scheme (Admin) | Yes |
| DELETE | `/api/schemes/:id` | Delete scheme (Admin) | Yes |

### Applications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/applications` | Submit new application | Yes |
| GET | `/api/applications` | Get user's applications | Yes |
| GET | `/api/applications/:id` | Get application by ID | Yes |
| DELETE | `/api/applications/:id` | Delete application | Yes |
| PATCH | `/api/applications/:id/status` | Update status (Admin) | Yes |
| GET | `/api/applications/admin/all` | Get all applications (Admin) | Yes |

### Documents

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/documents/upload` | Upload document | Yes |
| GET | `/api/documents/application/:id` | Get documents for application | Yes |
| DELETE | `/api/documents/:id` | Delete document | Yes |
| PATCH | `/api/documents/:id/verify` | Verify document (Admin) | Yes |

## 📝 API Usage Examples

### 1. Send OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'
```

### 2. Verify OTP & Register
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "otp": "123456",
    "userData": {
      "name": "Ramesh Kumar",
      "state": "Maharashtra",
      "district": "Pune",
      "landSize": 3.5,
      "cropType": "wheat",
      "farmerCategory": "small"
    }
  }'
```

### 3. Get Recommended Schemes
```bash
curl -X GET http://localhost:5000/api/schemes/user/recommended \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Submit Application
```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"schemeId": "SCHEME_ID_HERE"}'
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

1. Send OTP to user's phone
2. Verify OTP to get JWT token
3. Include token in subsequent requests:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

## 📁 Project Structure

```
Backend/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── controllers/              # Route handlers
│   │   ├── auth.controller.ts
│   │   ├── scheme.controller.ts
│   │   ├── application.controller.ts
│   │   └── document.controller.ts
│   ├── models/                   # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Scheme.ts
│   │   ├── Application.ts
│   │   ├── Document.ts
│   │   └── OTP.ts
│   ├── routes/                   # API routes
│   │   ├── auth.routes.ts
│   │   ├── scheme.routes.ts
│   │   ├── application.routes.ts
│   │   └── document.routes.ts
│   ├── middleware/               # Custom middleware
│   │   ├── auth.middleware.ts
│   │   └── validation.middleware.ts
│   ├── utils/                    # Utility functions
│   │   ├── jwtUtils.ts
│   │   └── otpService.ts
│   ├── types/                    # TypeScript types
│   │   └── index.ts
│   ├── scripts/                  # Utility scripts
│   │   └── seedSchemes.ts
│   └── server.ts                 # Entry point
├── uploads/                      # Uploaded files
├── .env                          # Environment variables
├── .env.example                  # Example env file
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Security Features

- ✅ Helmet.js for security headers
- ✅ CORS protection
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Input validation with express-validator
- ✅ JWT authentication
- ✅ File upload size limits (5MB)
- ✅ File type validation
- ✅ MongoDB injection protection

## 🐛 Development

### Check MongoDB Connection
```bash
# The server will log connection status on startup
npm run dev
```

Look for:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
📊 Database: yojnamitra
```

### Test Endpoints
```bash
# Health check
curl http://localhost:5000/health

# Get all schemes
curl http://localhost:5000/api/schemes
```

## 🚢 Deployment

### Deploy to Railway

1. Create account on [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Add MongoDB Atlas URI in environment variables
4. Railway will auto-deploy

### Deploy to Render

1. Create account on [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add environment variables

### Deploy to Heroku

```bash
heroku create yojnamitra-api
heroku config:set MONGODB_URI="your-mongodb-uri"
heroku config:set JWT_SECRET="your-jwt-secret"
git push heroku main
```

## 📊 Database Schema

### User
- name, phone, state, district, landSize, cropType, farmerCategory
- age (optional), incomeRange (optional)
- isPhoneVerified, timestamps

### Scheme
- name, category, description, benefits[], eligibility{}
- documents[], applyUrl, amount, isActive

### Application
- userId, schemeId, status, appliedDate, lastUpdated
- remarks, documentsUploaded[]

### Document
- applicationId, userId, documentType, fileName, fileUrl
- fileSize, mimeType, isVerified, uploadedAt

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use for your hackathon!

## 🆘 Troubleshooting

### MongoDB Connection Error
- Check if MongoDB Atlas cluster is running
- Verify connection string in `.env`
- Check IP whitelist in Atlas
- Ensure database user credentials are correct

### Port Already in Use
```bash
# Change PORT in .env file
PORT=5001
```

### OTP Not Sending
- In development, OTP is logged to console
- For production, integrate Twilio/MSG91 in `otpService.ts`

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Check API documentation in code comments

---

**Built with ❤️ for YojnaMitra Hackathon**
