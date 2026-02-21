import { useState } from 'react';
import authService from '../services/auth.service';
import '../styles/AuthPage.css';

interface AuthPageProps {
  onAuthSuccess: () => void;
  onBack: () => void;
}

type AuthStep = 'input' | 'otp' | 'register';
type AuthMethod = 'phone' | 'email';

function AuthPage({ onAuthSuccess, onBack }: AuthPageProps) {
  const [step, setStep] = useState<AuthStep>('input');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email'); // Default to email (FREE!)
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Registration form fields
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    district: '',
    landSize: '',
    cropType: '',
    farmerCategory: 'small' as 'small' | 'marginal' | 'large',
    age: '',
  });

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (authMethod === 'email') {
        const response = await authService.sendEmailOTP(email);
        console.log('Email OTP Response:', response);
        alert('OTP sent to your email! Check your inbox or console in development mode.');
      } else {
        const response = await authService.sendOTP(phone);
        console.log('Phone OTP Response:', response);
        alert('OTP sent to your phone! Check console in development mode.');
      }
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      
      if (authMethod === 'email') {
        // For email, check if user exists or needs registration
        response = await authService.verifyEmailOTP(email, otp);
      } else {
        response = await authService.verifyOTP(phone, otp);
      }
      
      if (response.success && response.data) {
        // Check if user profile is complete
        const user = response.data.user;
        
        if (!user.name || !user.state || !user.district || !user.landSize || !user.cropType) {
          // New user or incomplete profile - show registration form
          setStep('register');
        } else {
          // Existing user with complete profile
          onAuthSuccess();
        }
      }
    } catch (err: any) {
      // If email user doesn't exist, show registration form
      if (authMethod === 'email' && err.message?.includes('User data is required')) {
        setStep('register');
      } else {
        setError(err.message || 'Invalid OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (authMethod === 'email') {
        // For email registration, verify OTP with user data
        const userData = {
          name: formData.name,
          phone: phone || '0000000000', // Placeholder if no phone
          email: email,
          state: formData.state,
          district: formData.district,
          landSize: parseFloat(formData.landSize),
          cropType: formData.cropType,
          farmerCategory: formData.farmerCategory,
          age: formData.age ? parseInt(formData.age) : undefined,
        };
        
        await authService.verifyEmailOTP(email, otp, userData);
      } else {
        // For phone registration, update profile
        await authService.updateProfile({
          name: formData.name,
          state: formData.state,
          district: formData.district,
          landSize: parseFloat(formData.landSize),
          cropType: formData.cropType,
          farmerCategory: formData.farmerCategory,
          age: formData.age ? parseInt(formData.age) : undefined,
        });
      }
      
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="gradient-overlay"></div>
        <div className="grid-pattern"></div>
      </div>

      <div className="auth-container">
        <button className="back-button" onClick={onBack}>
          ← Back to Home
        </button>

        <div className="auth-card">
          <div className="auth-header">
            <img src="/logo.png" alt="YojnaMitra" className="auth-logo" />
            <h1>YojnaMitra</h1>
            <p className="auth-subtitle">
              {step === 'input' && 'Sign in to access government schemes'}
              {step === 'otp' && `Enter the OTP sent to your ${authMethod === 'email' ? 'email' : 'phone'}`}
              {step === 'register' && 'Complete your farmer profile'}
            </p>
          </div>

          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          {step === 'input' && (
            <form onSubmit={handleSendOTP} className="auth-form">
              {/* Auth Method Toggle */}
              <div className="auth-method-toggle">
                <button
                  type="button"
                  className={`toggle-btn ${authMethod === 'email' ? 'active' : ''}`}
                  onClick={() => setAuthMethod('email')}
                >
                  📧 Email (FREE!)
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${authMethod === 'phone' ? 'active' : ''}`}
                  onClick={() => setAuthMethod('phone')}
                >
                  📱 Phone
                </button>
              </div>

              {authMethod === 'email' ? (
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <small>✅ No SMS charges! OTP sent to your email</small>
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="Enter 10-digit phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    required
                    disabled={loading}
                  />
                  <small>We'll send you an OTP via SMS</small>
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn-submit" 
                disabled={loading || (authMethod === 'phone' && phone.length !== 10) || (authMethod === 'email' && !email)}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="auth-form">
              <div className="form-group">
                <label htmlFor="otp">Enter OTP</label>
                <input
                  type="text"
                  id="otp"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  disabled={loading}
                  autoFocus
                />
                <small>Check your phone for the OTP (valid for 10 minutes)</small>
              </div>
              <button type="submit" className="btn-submit" disabled={loading || otp.length !== 6}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button type="button" className="btn-text" onClick={() => setStep('input')}>
                Change {authMethod === 'email' ? 'email' : 'phone number'}
              </button>
            </form>
          )}

          {step === 'register' && (
            <form onSubmit={handleRegister} className="auth-form registration-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    minLength={2}
                    maxLength={100}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="age">Age</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    placeholder="Your age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min={18}
                    max={120}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    placeholder="e.g., Maharashtra"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="district">District *</label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    placeholder="e.g., Pune"
                    value={formData.district}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="landSize">Land Size (acres) *</label>
                  <input
                    type="number"
                    id="landSize"
                    name="landSize"
                    placeholder="e.g., 5"
                    value={formData.landSize}
                    onChange={handleInputChange}
                    min={0}
                    step={0.1}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="farmerCategory">Farmer Category *</label>
                  <select
                    id="farmerCategory"
                    name="farmerCategory"
                    value={formData.farmerCategory}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    <option value="marginal">Marginal (&lt;2.5 acres)</option>
                    <option value="small">Small (2.5-5 acres)</option>
                    <option value="large">Large (&gt;5 acres)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="cropType">Primary Crop Type *</label>
                <input
                  type="text"
                  id="cropType"
                  name="cropType"
                  placeholder="e.g., wheat, rice, cotton"
                  value={formData.cropType}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Completing Registration...' : 'Complete Registration'}
              </button>
            </form>
          )}
        </div>

        <div className="auth-footer">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
