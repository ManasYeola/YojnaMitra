import { useState } from 'react';
import authService from '../services/auth.service';
import '../styles/AuthPage.css';

interface SignUpPageProps {
  onAuthSuccess: () => void;
  onBack: () => void;
  onSwitchToSignIn: () => void;
}

type SignUpStep = 'register' | 'otp';
type AuthMethod = 'phone' | 'email';

function SignUpPage({ onAuthSuccess, onBack, onSwitchToSignIn }: SignUpPageProps) {
  const [step, setStep] = useState<SignUpStep>('register');
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
    incomeRange: '',
  });

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate phone or email
    if (authMethod === 'phone' && !/^[0-9]{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }
    
    if (authMethod === 'email' && !email) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.state || !formData.district || 
        !formData.landSize || !formData.cropType) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      if (authMethod === 'email') {
        const response = await authService.sendEmailOTP(email);
        console.log('Email OTP Response:', response);
        alert('OTP sent to your email! Check your inbox or backend terminal.');
      } else {
        const response = await authService.sendOTP(phone);
        console.log('Phone OTP Response:', response);
        alert('OTP sent to your phone! Check backend terminal.');
      }
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData: any = {
        name: formData.name,
        state: formData.state,
        district: formData.district,
        landSize: parseFloat(formData.landSize),
        cropType: formData.cropType,
        farmerCategory: formData.farmerCategory,
        age: formData.age ? parseInt(formData.age) : undefined,
        incomeRange: formData.incomeRange || undefined,
      };
      
      // Only include phone if using phone authentication
      if (authMethod === 'phone') {
        userData.phone = phone;
      }

      if (authMethod === 'email') {
        // Email authentication - register with email OTP
        const response = await authService.verifyEmailOTP(email, otp, userData);
        if (response.success) {
          onAuthSuccess();
        }
      } else {
        // Phone authentication - verify OTP first, then update profile
        const response = await authService.verifyOTP(phone, otp);
        
        if (response.success && response.data) {
          const user = response.data.user;
          
          // Check if user already has complete profile
          if (user.name && user.state && user.district && user.landSize && user.cropType) {
            setError('Account already exists. Please sign in instead.');
            setLoading(false);
            return;
          }
          
          // Update profile with all registration data
          await authService.updateProfile(userData);
          onAuthSuccess();
        }
      }
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
      <div className="auth-container">
        <button className="back-button" onClick={onBack}>←</button>
        
        <div className="auth-card signup-card">
          {/* Logo */}
          <div className="auth-logo-container">
            <img src="/logo.png" alt="Yojana Mitra" className="auth-logo-img" />
            <h2 className="auth-logo-text">Yojna Mitra</h2>
          </div>

          {/* Card Content Section */}
          <div className="auth-card-content">
            <h1 className="auth-title">Sign Up</h1>

            {error && <div className="auth-error">{error}</div>}

            {/* Registration Form - Step 1 */}
            {step === 'register' && (
              <form onSubmit={handleSendOTP} className="auth-form">
                {/* Name Fields */}
                <div className="form-row-2">
                  <div className="input-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="age">Age</label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="25"
                      min="18"
                      max="120"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Email/Phone */}
                {authMethod === 'email' ? (
                  <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="johndoe@xyz.com"
                      required
                      disabled={loading}
                    />
                  </div>
                ) : (
                  <div className="input-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter 10-digit number"
                      pattern="[0-9]{10}"
                      required
                      disabled={loading}
                    />
                  </div>
                )}

                {/* State and District */}
                <div className="form-row-2">
                  <div className="input-group">
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Maharashtra"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="district">District</label>
                    <input
                      type="text"
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="Pune"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Land Size and Category */}
                <div className="form-row-2">
                  <div className="input-group">
                    <label htmlFor="landSize">Land Size (acres)</label>
                    <input
                      type="number"
                      id="landSize"
                      name="landSize"
                      value={formData.landSize}
                      onChange={handleInputChange}
                      placeholder="5.5"
                      step="0.01"
                      min="0"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="farmerCategory">Farmer Category</label>
                    <select
                      id="farmerCategory"
                      name="farmerCategory"
                      value={formData.farmerCategory}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    >
                      <option value="small">Small</option>
                      <option value="marginal">Marginal</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>

                {/* Crop Type and Income */}
                <div className="form-row-2">
                  <div className="input-group">
                    <label htmlFor="cropType">Crop Type</label>
                    <input
                      type="text"
                      id="cropType"
                      name="cropType"
                      value={formData.cropType}
                      onChange={handleInputChange}
                      placeholder="Rice, Wheat"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="incomeRange">Income Range</label>
                    <input
                      type="text"
                      id="incomeRange"
                      name="incomeRange"
                      value={formData.incomeRange}
                      onChange={handleInputChange}
                      placeholder="Optional"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Sign Up'}
                </button>

                {/* Auth Method Toggle */}
                <div className="auth-method-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${authMethod === 'email' ? 'active' : ''}`}
                    onClick={() => setAuthMethod('email')}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${authMethod === 'phone' ? 'active' : ''}`}
                    onClick={() => setAuthMethod('phone')}
                  >
                    Phone
                  </button>
                </div>
              </form>
            )}

            {/* OTP Verification - Step 2 */}
            {step === 'otp' && (
              <form onSubmit={handleCompleteSignUp} className="auth-form">
                <div className="input-group">
                  <label htmlFor="otp">OTP Code</label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Complete Sign Up'}
                </button>

                <button 
                  type="button" 
                  className="link-button" 
                  onClick={() => setStep('register')}
                  disabled={loading}
                >
                  ← Back to Registration
                </button>
              </form>
            )}

            <div className="auth-switch">
              Already have an account? <button className="link-btn" onClick={onSwitchToSignIn}>Sign In</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
