# Eligibility Checking API Documentation

## Overview

The eligibility checking system intelligently analyzes government schemes synced from the MyScheme API and determines if a farmer is eligible based on their profile (state, crop type, land size, farmer category, age, income).

## Features

✓ **Intelligent Parsing**: Automatically extracts eligibility criteria from markdown text
✓ **Multi-Factor Matching**: Checks state, crop type, farmer category, land size, age, and income
✓ **Match Scoring**: Provides 0-100 score indicating how well the user matches the scheme
✓ **Detailed Feedback**: Returns matched/unmatched criteria with explanations
✓ **Batch Processing**: Check eligibility for multiple schemes at once

---

## API Endpoints

### 1. Check Eligibility for a Specific Scheme

**POST** `/api/schemes/:id/check-eligibility`

Check if a user is eligible for a specific scheme.

#### Authentication
- Optional (can provide userData in request body if not authenticated)
- If authenticated, uses logged-in user's profile

#### Request Body (if not authenticated)
```json
{
  "userData": {
    "state": "Maharashtra",
    "district": "Pune",
    "landSize": 2.5,
    "cropType": "rice",
    "farmerCategory": "small",
    "age": 35,
    "incomeRange": "3-5 lakhs"
  }
}
```

#### Response
```json
{
  "success": true,
  "message": "Eligibility check completed",
  "data": {
    "scheme": {
      "_id": "pmfby-pradhan-mantri-fasal-bima-yojana",
      "name": "Pradhan Mantri Fasal Bima Yojana",
      "category": ["Insurance"],
      "level": "Central",
      "state": null
    },
    "eligibility": {
      "isEligible": true,
      "matchScore": 85,
      "matchedCriteria": [
        "✓ Available in all states",
        "✓ Suitable for rice",
        "✓ Suitable for small farmers",
        "✓ Land size requirement met (2.5 hectares)"
      ],
      "unmatchedCriteria": [],
      "warnings": [],
      "parsedEligibility": {
        "states": ["All States"],
        "crops": ["rice", "wheat", "cotton"],
        "categories": ["small", "marginal", "large"],
        "ageRange": {},
        "landSize": { "max": 10 },
        "income": {},
        "other": []
      }
    }
  }
}
```

---

### 2. Get All Eligible Schemes for User

**GET** `/api/schemes/eligible?minScore=50&limit=20`

Get all schemes that the logged-in user is eligible for, sorted by match score.

#### Authentication
- **Required**: Must be logged in

#### Query Parameters
- `minScore` (optional): Minimum match score (0-100). Default: 50
- `limit` (optional): Maximum number of results. Default: 20

#### Response
```json
{
  "success": true,
  "message": "Eligible schemes fetched successfully",
  "data": {
    "count": 15,
    "totalEligible": 42,
    "schemes": [
      {
        "scheme": {
          "_id": "pm-kisan",
          "name": "PM-KISAN",
          "category": ["Direct Benefit Transfer"],
          "level": "Central",
          "description": "Income support to farmers...",
          "amount": "₹6000/year",
          "applyUrl": "https://pmkisan.gov.in"
        },
        "eligibility": {
          "isEligible": true,
          "matchScore": 95,
          "matchedCriteria": [
            "✓ Available in all states",
            "✓ Suitable for small farmers",
            "✓ Land size requirement met (2.5 hectares)"
          ],
          "unmatchedCriteria": [],
          "warnings": []
        }
      }
    ]
  }
}
```

---

### 3. Batch Eligibility Check

**POST** `/api/schemes/check-eligibility-batch`

Check eligibility for multiple schemes at once.

#### Authentication
- Optional (can provide userData in request body)

#### Request Body
```json
{
  "schemeIds": [
    "pmfby-pradhan-mantri-fasal-bima-yojana",
    "pm-kisan",
    "rkvy-scheme"
  ],
  "userData": {
    "state": "Punjab",
    "landSize": 5,
    "cropType": "wheat",
    "farmerCategory": "marginal"
  }
}
```

#### Response
```json
{
  "success": true,
  "message": "Batch eligibility check completed",
  "data": {
    "count": 3,
    "results": [
      {
        "schemeId": "pmfby-pradhan-mantri-fasal-bima-yojana",
        "schemeName": "Pradhan Mantri Fasal Bima Yojana",
        "eligibility": {
          "isEligible": true,
          "matchScore": 90,
          "matchedCriteria": ["✓ Available in Punjab", "..."],
          "unmatchedCriteria": [],
          "warnings": []
        }
      }
    ]
  }
}
```

---

## Eligibility Criteria Detection

The system intelligently parses markdown eligibility criteria and extracts:

### 1. **States**
- Detects mentions of Indian states
- Recognizes "All States", "Pan India", "All India"
- Examples: "Available in Maharashtra", "For all states"

### 2. **Crops**
- Identifies 40+ common crops (rice, wheat, cotton, etc.)
- Examples: "For rice and wheat farmers", "Applicable to all crops"

### 3. **Farmer Categories**
- Detects: small, marginal, large farmers
- Examples: "For small and marginal farmers", "All farmers"

### 4. **Land Size**
- Parses ranges: "2 to 5 hectares", "up to 10 acres"
- Handles min/max: "minimum 1 hectare", "maximum 5 hectares"
- Auto-converts acres to hectares

### 5. **Age Range**
- Patterns: "18 to 60 years", "minimum age 18", "above 21 years"

### 6. **Income**
- Detects income limits: "annual income up to ₹2 lakhs"
- Handles ranges: "₹1 lakh to ₹5 lakhs"

---

## Match Scoring Algorithm

The system calculates a 0-100 match score based on:

1. **Each criterion** that applies gets equal weight
2. **Passed checks** contribute to the score
3. **Failed checks** mark scheme as ineligible
4. **Missing data** generates warnings but doesn't fail

### Example Calculation:
- 5 criteria checked (state, crop, category, land, age)
- 4 criteria passed
- Score = (4/5) × 100 = **80%**

---

## Integration Examples

### Frontend Integration

```typescript
// Check if user is eligible for a scheme
const checkEligibility = async (schemeId: string) => {
  const response = await fetch(
    `${API_BASE}/schemes/${schemeId}/check-eligibility`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  
  if (data.data.eligibility.isEligible) {
    console.log('Eligible! Match score:', data.data.eligibility.matchScore);
    console.log('Reasons:', data.data.eligibility.matchedCriteria);
  } else {
    console.log('Not eligible:', data.data.eligibility.unmatchedCriteria);
  }
};

// Get all eligible schemes
const getEligibleSchemes = async () => {
  const response = await fetch(
    `${API_BASE}/schemes/eligible?minScore=60&limit=10`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  const data = await response.json();
  console.log(`Found ${data.data.count} eligible schemes`);
};
```

---

## Use Cases

### 1. **Scheme Discovery Page**
Show users only schemes they're eligible for based on their profile:
```
GET /api/schemes/eligible?minScore=70
```

### 2. **Application Page**
Before allowing application, check eligibility and show reasons:
```
POST /api/schemes/:id/check-eligibility
```

### 3. **Comparison Tool**
Let users compare eligibility across multiple schemes:
```
POST /api/schemes/check-eligibility-batch
```

### 4. **Public Search**
Non-logged-in users can check eligibility by providing data:
```javascript
POST /api/schemes/:id/check-eligibility
{
  "userData": { ... }
}
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│  sync-service (runs daily at 2 AM)                      │
│  Fetches schemes from MyScheme API → MongoDB            │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Backend reads schemes from shared MongoDB collection   │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  eligibility.service.ts                                 │
│  1. Parses markdown eligibility_md field                │
│  2. Extracts criteria (state, crop, age, etc.)          │
│  3. Matches against user profile                        │
│  4. Calculates match score                              │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  API Response with eligibility results                  │
└─────────────────────────────────────────────────────────┘
```

---

## Testing

### Test with cURL

```bash
# Check eligibility (with user data)
curl -X POST http://localhost:5000/api/schemes/pm-kisan/check-eligibility \
  -H "Content-Type: application/json" \
  -d '{
    "userData": {
      "state": "Punjab",
      "landSize": 3,
      "cropType": "wheat",
      "farmerCategory": "small"
    }
  }'

# Get eligible schemes (authenticated)
curl http://localhost:5000/api/schemes/eligible?minScore=50 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Batch check
curl -X POST http://localhost:5000/api/schemes/check-eligibility-batch \
  -H "Content-Type: application/json" \
  -d '{
    "schemeIds": ["pm-kisan", "pmfby"],
    "userData": {
      "state": "Maharashtra",
      "landSize": 2,
      "farmerCategory": "marginal"
    }
  }'
```

---

## Notes

1. **Backward Compatibility**: The new schema maintains legacy fields (category enum, benefits array) for existing frontend compatibility

2. **Synced Data**: Schemes are synced daily from MyScheme API. The Backend reads from the same `schemes` collection

3. **Flexible Matching**: If markdown parsing fails, falls back to structured eligibility fields

4. **Performance**: Results are calculated on-demand (not cached). For better performance, consider implementing caching

5. **Future Enhancements**:
   - ML-based criteria extraction
   - Natural language processing for complex eligibility rules
   - Personalized recommendations based on application history
   - Eligibility predictions for upcoming schemes

---

## Support

For issues or questions, check:
- [Backend README](./README.md)
- [Sync Service README](../sync-service/README.md)
