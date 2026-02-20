# Frontend-Backend Integration Guide

## Setup Complete ✅

Your YojnaMitra frontend and backend are now integrated!

## What Was Created

### 1. Frontend API Services (`frontend/src/`)

- **`config/api.config.ts`** - API endpoints configuration
- **`services/api.service.ts`** - Axios client with interceptors
- **`services/auth.service.ts`** - Authentication API calls
- **`services/scheme.service.ts`** - Schemes API calls
- **`services/application.service.ts`** - Applications API calls

### 2. Environment Configuration

- **`frontend/.env`** - Frontend environment variables
- **`Backend/.env`** - Backend environment variables (MongoDB, JWT, etc.)

### 3. Dependencies

- **axios** - Installed in frontend for HTTP requests

## How to Use the Services

### Authentication Example

```typescript
import authService from './services/auth.service';

// Send OTP
const handleSendOTP = async () => {
  try {
    const response = await authService.sendOTP('9876543210');
    console.log(response.message); // "OTP sent successfully"
  } catch (error) {
    console.error('Failed to send OTP:', error);
  }
};

// Verify OTP
const handleVerifyOTP = async () => {
  try {
    const response = await authService.verifyOTP('9876543210', '123456');
    console.log('User:', response.data?.user);
    // Token is automatically stored in localStorage
  } catch (error) {
    console.error('OTP verification failed:', error);
  }
};

// Get profile
const handleGetProfile = async () => {
  try {
    const profile = await authService.getProfile();
    console.log('Profile:', profile);
  } catch (error) {
    console.error('Failed to get profile:', error);
  }
};

// Update profile
const handleUpdateProfile = async () => {
  try {
    const updatedProfile = await authService.updateProfile({
      name: 'John Doe',
      state: 'Maharashtra',
      landSize: 5,
    });
    console.log('Updated:', updatedProfile);
  } catch (error) {
    console.error('Failed to update profile:', error);
  }
};

// Logout
const handleLogout = () => {
  authService.logout();
};

// Check if authenticated
const isLoggedIn = authService.isAuthenticated();
```

### Schemes Example

```typescript
import schemeService from './services/scheme.service';

// Get all schemes
const handleGetSchemes = async () => {
  try {
    const response = await schemeService.getAllSchemes();
    console.log('Schemes:', response.data);
  } catch (error) {
    console.error('Failed to get schemes:', error);
  }
};

// Get schemes with filters
const handleGetFilteredSchemes = async () => {
  try {
    const response = await schemeService.getAllSchemes({
      category: 'loan',
      state: 'Maharashtra',
      search: 'crop',
      page: 1,
      limit: 10,
    });
    console.log('Filtered schemes:', response.data);
  } catch (error) {
    console.error('Failed to get schemes:', error);
  }
};

// Get scheme by ID
const handleGetScheme = async (id: string) => {
  try {
    const scheme = await schemeService.getSchemeById(id);
    console.log('Scheme details:', scheme);
  } catch (error) {
    console.error('Failed to get scheme:', error);
  }
};

// Get recommended schemes (requires authentication)
const handleGetRecommended = async () => {
  try {
    const schemes = await schemeService.getRecommendedSchemes();
    console.log('Recommended schemes:', schemes);
  } catch (error) {
    console.error('Failed to get recommendations:', error);
  }
};
```

### Applications Example

```typescript
import applicationService from './services/application.service';

// Create application
const handleApply = async (schemeId: string) => {
  try {
    const application = await applicationService.createApplication(schemeId);
    console.log('Application created:', application);
  } catch (error) {
    console.error('Failed to apply:', error);
  }
};

// Get user's applications
const handleGetApplications = async () => {
  try {
    const applications = await applicationService.getUserApplications();
    console.log('My applications:', applications);
  } catch (error) {
    console.error('Failed to get applications:', error);
  }
};

// Check if already applied
const handleCheckApplied = async (schemeId: string) => {
  try {
    const hasApplied = await applicationService.hasAppliedToScheme(schemeId);
    if (hasApplied) {
      console.log('Already applied to this scheme');
    }
  } catch (error) {
    console.error('Failed to check application status:', error);
  }
};

// Get applications by status
const handleGetPending = async () => {
  try {
    const pending = await applicationService.getApplicationsByStatus('pending');
    console.log('Pending applications:', pending);
  } catch (error) {
    console.error('Failed to get pending applications:', error);
  }
};
```

## Integration in Components

### Example: Login Component

```typescript
import { useState } from 'react';
import authService from '../services/auth.service';

function LoginComponent() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.sendOTP(phone);
      setStep('otp');
      alert('OTP sent successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.verifyOTP(phone, otp);
      alert('Login successful!');
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {step === 'phone' ? (
        <form onSubmit={handleSendOTP}>
          <input
            type="tel"
            placeholder="Enter 10-digit phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={10}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP}>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

## Starting the Servers

### 1. Start Backend (Terminal 1)
```bash
cd Backend
npm run dev
# Server runs on http://localhost:5000
```

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

## API Endpoints Available

### Authentication
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP & Login
- `GET /api/auth/profile` - Get user profile (Protected)
- `PATCH /api/auth/profile` - Update profile (Protected)

### Schemes
- `GET /api/schemes` - Get all schemes
- `GET /api/schemes/:id` - Get scheme by ID
- `GET /api/schemes/user/recommended` - Get recommended schemes (Protected)

### Applications
- `POST /api/applications` - Create application (Protected)
- `GET /api/applications` - Get user applications (Protected)
- `GET /api/applications/:id` - Get application by ID (Protected)
- `DELETE /api/applications/:id` - Delete application (Protected)

## Authentication Flow

1. Token is automatically added to all API requests via interceptor
2. Token is stored in `localStorage` after successful login
3. If API returns 401 (Unauthorized), user is automatically logged out
4. Use `authService.isAuthenticated()` to check login status

## Error Handling

All services use try-catch blocks. Errors are thrown with the following structure:

```typescript
{
  success: false,
  message: "Error message",
  errors?: [] // Validation errors
}
```

## Next Steps

1. ✅ Backend is configured with MongoDB
2. ✅ Frontend services are ready
3. ✅ Environment variables are set
4. 🔄 Integrate services into your React components
5. 🔄 Test the complete flow
6. 🔄 Add loading states and error handling in UI

## Testing

Use Postman or curl to test backend endpoints first, then integrate into frontend components.

Happy coding! 🚀
