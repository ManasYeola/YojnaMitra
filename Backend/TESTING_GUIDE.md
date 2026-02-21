# Quick Test Guide - Eligibility Checking

## Prerequisites
1. Ensure sync-service has synced schemes to MongoDB
2. Backend server is running on port 5000
3. You have a valid JWT token (or will provide userData)

## Test Steps

### Step 1: Start the Sync Service (if not already synced)

```bash
cd sync-service
npm install
npm run sync
```

This will fetch schemes from MyScheme API and populate your MongoDB.

### Step 2: Start the Backend

```bash
cd Backend
npm install
npm run dev
```

### Step 3: Test the Eligibility API

#### Test 1: Check eligibility without login (provide userData)

```bash
curl -X POST http://localhost:5000/api/schemes/pmfby-pradhan-mantri-fasal-bima-yojana/check-eligibility \
  -H "Content-Type: application/json" \
  -d '{
    "userData": {
      "state": "Maharashtra",
      "landSize": 2.5,
      "cropType": "rice",
      "farmerCategory": "small",
      "age": 35
    }
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Eligibility check completed",
  "data": {
    "scheme": {
      "_id": "pmfby-pradhan-mantri-fasal-bima-yojana",
      "name": "Pradhan Mantri Fasal Bima Yojana",
      "category": ["Insurance"],
      "level": "Central"
    },
    "eligibility": {
      "isEligible": true,
      "matchScore": 85,
      "matchedCriteria": [
        "✓ Available in Maharashtra",
        "✓ Suitable for rice",
        "✓ Suitable for small farmers"
      ],
      "unmatchedCriteria": [],
      "warnings": []
    }
  }
}
```

#### Test 2: Get all eligible schemes (requires login)

First, login and get a token:
```bash
# Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'

# Verify OTP (use the OTP sent to console/logs)
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "123456"}'
```

Then get eligible schemes:
```bash
curl http://localhost:5000/api/schemes/eligible?minScore=60&limit=10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### Test 3: Batch check multiple schemes

```bash
curl -X POST http://localhost:5000/api/schemes/check-eligibility-batch \
  -H "Content-Type: application/json" \
  -d '{
    "schemeIds": [
      "pm-kisan",
      "pmfby-pradhan-mantri-fasal-bima-yojana"
    ],
    "userData": {
      "state": "Punjab",
      "landSize": 3,
      "cropType": "wheat",
      "farmerCategory": "marginal"
    }
  }'
```

## Verification Checklist

- [ ] Sync service successfully synced schemes to MongoDB
- [ ] Backend server started without errors
- [ ] Eligibility check returns expected results
- [ ] Match score is between 0-100
- [ ] Matched/unmatched criteria are listed clearly
- [ ] Eligible schemes endpoint requires authentication
- [ ] Batch check works for multiple schemes

## Troubleshooting

### Problem: "Scheme not found"
**Solution**: Run sync-service to populate schemes in MongoDB

### Problem: "User data required"
**Solution**: Either:
1. Login and use authenticated endpoint, OR
2. Provide `userData` object in request body

### Problem: No schemes returned for eligible endpoint
**Solution**: 
1. Check user profile has required fields (state, landSize, cropType, farmerCategory)
2. Lower the minScore parameter (e.g., `?minScore=40`)
3. Verify schemes are active in database

### Problem: TypeScript errors in examples/
**Solution**: These are expected. The examples/ folder is for reference only.

## What to Check in Response

1. **isEligible**: true/false - Can the user apply?
2. **matchScore**: 0-100 - How well does user match?
3. **matchedCriteria**: List of why user qualifies
4. **unmatchedCriteria**: List of why user doesn't qualify
5. **warnings**: Things to be aware of
6. **parsedEligibility**: What criteria were extracted from markdown

## Next Steps

1. ✅ Test all three endpoints
2. ✅ Integrate into frontend
3. ✅ Add to application flow (show eligibility before applying)
4. ✅ Create farmer-facing UI to show eligible schemes
5. ✅ Add filters based on match score

## Frontend Integration

See [eligibility-examples.tsx](./examples/eligibility-examples.tsx) for React component examples.

See [ELIGIBILITY_API.md](./ELIGIBILITY_API.md) for complete API documentation.
