# YojnaMitra API Testing Guide

Complete API testing guide with examples for Postman, Thunder Client, or curl.

## 🔗 Base URL

**Development**: `http://localhost:5000`
**Production**: `https://your-domain.com`

---

## 1️⃣ Authentication Flow

### Step 1: Send OTP

**Endpoint**: `POST /api/auth/send-otp`

**Request Body**:
```json
{
  "phone": "9876543210"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phone": "9876543210",
    "expiresIn": "10 minutes"
  }
}
```

**Check Console** - In development mode, OTP is logged:
```
📱 Sending OTP to 9876543210: 123456
✅ [DEV MODE] OTP for 9876543210: 123456
```

---

### Step 2: Verify OTP & Register/Login

**Endpoint**: `POST /api/auth/verify-otp`

**For New User Registration**:
```json
{
  "phone": "9876543210",
  "otp": "123456",
  "userData": {
    "name": "Ramesh Kumar",
    "state": "Maharashtra",
    "district": "Pune",
    "landSize": 3.5,
    "cropType": "wheat",
    "farmerCategory": "small",
    "age": 45
  }
}
```

**For Existing User Login**:
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "Ramesh Kumar",
      "phone": "9876543210",
      "state": "Maharashtra",
      "district": "Pune",
      "landSize": 3.5,
      "cropType": "wheat",
      "farmerCategory": "small"
    }
  }
}
```

**⚠️ SAVE THE TOKEN** - You'll need it for authenticated requests!

---

## 2️⃣ User Profile Management

### Get User Profile

**Endpoint**: `GET /api/auth/profile`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Ramesh Kumar",
    "phone": "9876543210",
    "state": "Maharashtra",
    "district": "Pune",
    "landSize": 3.5,
    "cropType": "wheat",
    "farmerCategory": "small",
    "age": 45,
    "isPhoneVerified": true,
    "createdAt": "2026-02-20T10:30:00.000Z",
    "updatedAt": "2026-02-20T10:30:00.000Z"
  }
}
```

---

### Update User Profile

**Endpoint**: `PATCH /api/auth/profile`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body** (update any fields):
```json
{
  "landSize": 4.0,
  "cropType": "rice",
  "age": 46
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    // Updated user object
  }
}
```

---

## 3️⃣ Schemes

### Get All Schemes

**Endpoint**: `GET /api/schemes`

**Query Parameters** (optional):
- `category`: insurance, subsidy, loan, training, equipment, or all
- `isActive`: true or false

**Examples**:
```
GET /api/schemes
GET /api/schemes?category=insurance
GET /api/schemes?category=loan&isActive=true
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Schemes fetched successfully",
  "data": {
    "count": 8,
    "schemes": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        "category": "subsidy",
        "description": "Direct income support of ₹6,000 per year...",
        "benefits": [
          "₹2,000 per installment (3 times a year)",
          "Direct bank transfer",
          "No paperwork after registration"
        ],
        "eligibility": {
          "states": ["All States"],
          "farmerCategory": ["small", "marginal", "large"]
        },
        "documents": ["Aadhaar Card", "Bank Account Details"],
        "applyUrl": "https://pmkisan.gov.in",
        "amount": "₹6,000/year",
        "isActive": true
      }
      // ... more schemes
    ]
  }
}
```

---

### Get Scheme by ID

**Endpoint**: `GET /api/schemes/:id`

**Example**:
```
GET /api/schemes/65a1b2c3d4e5f6g7h8i9j0k1
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Scheme fetched successfully",
  "data": {
    // Single scheme object
  }
}
```

---

### Get Recommended Schemes (Personalized)

**Endpoint**: `GET /api/schemes/user/recommended`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Recommended schemes fetched successfully",
  "data": {
    "count": 6,
    "recommendations": [
      {
        "scheme": {
          // Scheme object
        },
        "matchScore": 90,
        "matchReasons": [
          "Available in your state",
          "Suitable for wheat farmers",
          "Designed for small farmers",
          "Meets minimum land requirement"
        ]
      }
      // ... more recommendations sorted by score
    ]
  }
}
```

---

## 4️⃣ Applications

### Submit New Application

**Endpoint**: `POST /api/applications`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body**:
```json
{
  "schemeId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "schemeId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "status": "pending",
    "appliedDate": "2026-02-20T10:30:00.000Z",
    "lastUpdated": "2026-02-20T10:30:00.000Z",
    "documentsUploaded": []
  }
}
```

---

### Get User's Applications

**Endpoint**: `GET /api/applications`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters** (optional):
- `status`: pending, approved, rejected, under-review

**Examples**:
```
GET /api/applications
GET /api/applications?status=pending
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Applications fetched successfully",
  "data": {
    "count": 3,
    "applications": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
        "schemeId": {
          "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
          "name": "PM-KISAN",
          "category": "subsidy",
          "amount": "₹6,000/year"
        },
        "status": "pending",
        "appliedDate": "2026-02-20T10:30:00.000Z"
      }
      // ... more applications
    ]
  }
}
```

---

### Get Application by ID

**Endpoint**: `GET /api/applications/:id`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Application fetched successfully",
  "data": {
    // Full application details with populated scheme
  }
}
```

---

### Delete Application

**Endpoint**: `DELETE /api/applications/:id`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Note**: Only pending applications can be deleted

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Application deleted successfully"
}
```

---

## 5️⃣ Documents

### Upload Document

**Endpoint**: `POST /api/documents/upload`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Form Data**:
```
applicationId: "65a1b2c3d4e5f6g7h8i9j0k2"
documentType: "Aadhaar Card"
document: [FILE] (JPEG, PNG, or PDF, max 5MB)
```

**cURL Example**:
```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "applicationId=65a1b2c3d4e5f6g7h8i9j0k2" \
  -F "documentType=Aadhaar Card" \
  -F "document=@/path/to/aadhaar.jpg"
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "applicationId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "documentType": "Aadhaar Card",
    "fileName": "aadhaar.jpg",
    "fileUrl": "./uploads/1708510800000-123456789.jpg",
    "fileSize": 245678,
    "mimeType": "image/jpeg",
    "isVerified": false,
    "uploadedAt": "2026-02-20T10:30:00.000Z"
  }
}
```

---

### Get Documents for Application

**Endpoint**: `GET /api/documents/application/:applicationId`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Documents fetched successfully",
  "data": {
    "count": 2,
    "documents": [
      // Array of document objects
    ]
  }
}
```

---

### Delete Document

**Endpoint**: `DELETE /api/documents/:id`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

## 6️⃣ Admin Routes

### Update Application Status (Admin)

**Endpoint**: `PATCH /api/applications/:id/status`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body**:
```json
{
  "status": "approved",
  "remarks": "All documents verified. Application approved."
}
```

**Valid Status Values**: pending, approved, rejected, under-review

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": {
    // Updated application object
  }
}
```

---

### Get All Applications (Admin)

**Endpoint**: `GET /api/applications/admin/all`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters**:
- `status`: Filter by status
- `schemeId`: Filter by scheme
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Examples**:
```
GET /api/applications/admin/all
GET /api/applications/admin/all?status=pending&page=1&limit=10
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Applications fetched successfully",
  "data": {
    "applications": [
      // Array with user and scheme details populated
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

---

### Verify Document (Admin)

**Endpoint**: `PATCH /api/documents/:id/verify`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body**:
```json
{
  "isVerified": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Document verified successfully",
  "data": {
    // Updated document object
  }
}
```

---

## 🧪 Postman Collection

### Quick Setup

1. **Import Collection**: Create new collection "YojnaMitra API"

2. **Set Base URL Variable**:
   - Key: `baseUrl`
   - Value: `http://localhost:5000`

3. **Set Token Variable** (after login):
   - Key: `authToken`
   - Value: `YOUR_JWT_TOKEN`

4. **Use Variables in Requests**:
   - URL: `{{baseUrl}}/api/schemes`
   - Header: `Authorization: Bearer {{authToken}}`

---

## 🔧 Testing Workflow

### Complete Flow Example

```bash
# 1. Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'

# 2. Check console for OTP (in dev mode)
# OTP: 123456

# 3. Verify OTP & Register
TOKEN=$(curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone":"9876543210",
    "otp":"123456",
    "userData":{
      "name":"Ramesh Kumar",
      "state":"Maharashtra",
      "district":"Pune",
      "landSize":3.5,
      "cropType":"wheat",
      "farmerCategory":"small"
    }
  }' | jq -r '.data.token')

# 4. Get Recommended Schemes
curl -X GET http://localhost:5000/api/schemes/user/recommended \
  -H "Authorization: Bearer $TOKEN"

# 5. Get Scheme ID from response, then apply
curl -X POST http://localhost:5000/api/applications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"schemeId":"SCHEME_ID_HERE"}'

# 6. Get My Applications
curl -X GET http://localhost:5000/api/applications \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Common Errors

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token is required"
}
```
**Solution**: Add Authorization header with valid JWT token

---

### 400 Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Please provide a valid 10-digit phone number"
}
```
**Solution**: Check request body format

---

### 404 Not Found
```json
{
  "success": false,
  "message": "Scheme not found"
}
```
**Solution**: Verify the ID exists in database

---

### 413 File Too Large
```json
{
  "success": false,
  "message": "File size exceeds the maximum limit"
}
```
**Solution**: Reduce file size to < 5MB

---

## 📊 Response Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Expired token |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

**Happy Testing! 🚀**
