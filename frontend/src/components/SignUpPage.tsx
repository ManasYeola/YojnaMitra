import { useState } from 'react';
import authService from '../services/auth.service';
import '../styles/AuthPage.css';

interface SignUpPageProps {
  onAuthSuccess: () => void;
  onBack: () => void;
  onSwitchToSignIn: () => void;
}

type SignUpStep = 'register' | 'otp';

function SignUpPage({ onAuthSuccess, onBack, onSwitchToSignIn }: SignUpPageProps) {
  const [step, setStep] = useState<SignUpStep>('register');
  const [phone, setPhone] = useState('');
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

    // Validate phone number
    if (!/^[0-9]{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number');
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
      const response = await authService.sendOTP(phone);
      console.log('OTP Response:', response);
      setStep('otp');
      alert('OTP sent successfully! Check console in development mode.');
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
      // First verify OTP
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
        await authService.updateProfile({
          name: formData.name,
          state: formData.state,
          district: formData.district,
          landSize: parseFloat(formData.landSize),
          cropType: formData.cropType,
          farmerCategory: formData.farmerCategory,
          age: formData.age ? parseInt(formData.age) : undefined,
          incomeRange: formData.incomeRange || undefined,
        });
        
        onAuthSuccess();
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
            {step === 'otp' && `Enter the OTP sent to ${phone}`}
          </p>

          {error && <div className="auth-error">{error}</div>}

          {/* Registration Form - Step 1 */}
          {step === 'register' && (
            <form onSubmit={handleSendOTP} className="auth-form">
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
              </div>

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
                  <label htmlFor="district">District *</label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder="Enter your district"
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
                    value={formData.landSize}
                    onChange={handleInputChange}
                    placeholder="Enter land size"
                    step="0.01"
                    min="0"
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
                    <option value="small">Small</option>
                    <option value="marginal">Marginal</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cropType">Crop Type *</label>
                  <input
                    type="text"
                    id="cropType"
                    name="cropType"
                    value={formData.cropType}
                    onChange={handleInputChange}
                    placeholder="e.g., Rice, Wheat, Cotton"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
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
