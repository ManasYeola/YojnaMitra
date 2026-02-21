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
    farmerType: '',
    landOwnership: '',
    ageRange: '',
    caste: 'not_disclosed',
    incomeRange: '',
    isBPL: '' as '' | 'true' | 'false',
    specialCategory: [] as string[],
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
    if (!formData.name || !formData.state || !formData.farmerType ||
        !formData.landOwnership || !formData.ageRange || !formData.incomeRange || !formData.isBPL) {
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
        farmerType: formData.farmerType || undefined,
        landOwnership: formData.landOwnership || undefined,
        ageRange: formData.ageRange || undefined,
        caste: formData.caste || undefined,
        incomeRange: formData.incomeRange || undefined,
        isBPL: formData.isBPL !== '' ? formData.isBPL === 'true' : undefined,
        specialCategory: formData.specialCategory.length > 0 ? formData.specialCategory : [],
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
          if (user.name && user.state && user.farmerType) {
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
        <button className="back-button" onClick={onBack}>← Back to Home</button>
        
        <div className="auth-card">
          <h1 className="auth-title">Sign Up</h1>
          <p className="auth-subtitle">
            {step === 'register' && 'Create your account - fill in your details below'}
            {step === 'otp' && `Enter the OTP sent to your ${authMethod === 'email' ? 'email' : 'phone'}`}
          </p>

          {error && <div className="auth-error">{error}</div>}

          {/* Registration Form - Step 1 */}
          {step === 'register' && (
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
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    disabled={loading}
                  />
                  <small>✅ No SMS charges! OTP sent to your email</small>
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter 10-digit phone number"
                    pattern="[0-9]{10}"
                    required
                    disabled={loading}
                  />
                  <small>We'll send you an OTP via SMS</small>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
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
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Optional"
                    min="18"
                    max="120"
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
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Enter your state"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="farmerType">I am a... *</label>
                  <select
                    id="farmerType"
                    name="farmerType"
                    value={formData.farmerType}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select type</option>
                    <option value="crop_farmer">🌾 Farmer (Crop)</option>
                    <option value="dairy">🐄 Dairy Farmer</option>
                    <option value="fisherman">🐟 Fisherman</option>
                    <option value="labourer">👷 Agriculture Labourer</option>
                    <option value="entrepreneur">🏭 Agri Entrepreneur</option>
                    <option value="other">👤 Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="landOwnership">Land Ownership *</label>
                  <select
                    id="landOwnership"
                    name="landOwnership"
                    value={formData.landOwnership}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select</option>
                    <option value="owned">✅ Own Land</option>
                    <option value="leased">📄 Leased Land</option>
                    <option value="none">❌ No Land</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="ageRange">Age Group *</label>
                  <select
                    id="ageRange"
                    name="ageRange"
                    value={formData.ageRange}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select age group</option>
                    <option value="below_18">Below 18</option>
                    <option value="18_40">18 – 40</option>
                    <option value="41_60">41 – 60</option>
                    <option value="above_60">Above 60</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="caste">Caste Category</label>
                  <select
                    id="caste"
                    name="caste"
                    value={formData.caste}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <option value="not_disclosed">Prefer not to say</option>
                    <option value="general">General</option>
                    <option value="sc">SC</option>
                    <option value="st">ST</option>
                    <option value="obc">OBC</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="incomeRange">Annual Income *</label>
                  <select
                    id="incomeRange"
                    name="incomeRange"
                    value={formData.incomeRange}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select income range</option>
                    <option value="below_1L">Below ₹1 Lakh</option>
                    <option value="1_3L">₹1 – 3 Lakh</option>
                    <option value="3_8L">₹3 – 8 Lakh</option>
                    <option value="above_8L">Above ₹8 Lakh</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="isBPL">BPL Card Holder *</label>
                  <select
                    id="isBPL"
                    name="isBPL"
                    value={formData.isBPL}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select</option>
                    <option value="true">✅ Yes</option>
                    <option value="false">❌ No</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>

              <div className="auth-footer">
                <p>
                  Already have an account?{' '}
                  <button 
                    type="button"
                    className="auth-link-button" 
                    onClick={onSwitchToSignIn}
                    disabled={loading}
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* OTP Verification - Step 2 */}
          {step === 'otp' && (
            <form onSubmit={handleCompleteSignUp} className="auth-form">
              <div className="form-group">
                <label htmlFor="otp">OTP *</label>
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
                <small>Check your phone or backend console for the OTP</small>
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Creating Account...' : 'Complete Sign Up'}
              </button>

              <button 
                type="button" 
                className="auth-link-button" 
                onClick={() => setStep('register')}
                disabled={loading}
              >
                ← Back to Registration Form
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
