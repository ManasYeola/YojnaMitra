import { useState } from 'react';
import authService from '../services/auth.service';
import '../styles/AuthPage.css';

interface SignInPageProps {
  onAuthSuccess: () => void;
  onBack: () => void;
  onSwitchToSignUp: () => void;
}

type SignInStep = 'input' | 'otp';
type AuthMethod = 'phone' | 'email';

function SignInPage({ onAuthSuccess, onBack, onSwitchToSignUp }: SignInPageProps) {
  const [step, setStep] = useState<SignInStep>('input');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email'); // Default to email
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (authMethod === 'email') {
        const response = await authService.verifyEmailOTP(email, otp);
        
        if (response.success && response.data) {
          const user = response.data.user;
          
          // Check if user has complete profile
          if (!user.name || !user.state || !user.district || !user.landSize || !user.cropType) {
            setError('Account not found or incomplete. Please sign up first.');
            setLoading(false);
            return;
          }
          
          onAuthSuccess();
        }
      } else {
        const response = await authService.verifyOTP(phone, otp);
        
        if (response.success && response.data) {
          const user = response.data.user;
          
          // Check if user has complete profile
          if (!user.name || !user.state || !user.district || !user.landSize || !user.cropType) {
            setError('Account not found or incomplete. Please sign up first.');
            setLoading(false);
            return;
          }
          
          // Existing user with complete profile
          onAuthSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <button className="back-button" onClick={onBack}>←</button>
        
        <div className="auth-card">
          {/* Logo */}
          <div className="auth-logo-container">
            <img src="/logo.png" alt="Yojana Mitra" className="auth-logo-img" />
            <h2 className="auth-logo-text">Yojna Mitra</h2>
          </div>

          {/* Card Content Section */}
          <div className="auth-card-content">
            <h1 className="auth-title">Log In</h1>

            {error && <div className="auth-error">{error}</div>}

            {step === 'input' && (
              <form onSubmit={handleSendOTP} className="auth-form">
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

                <div className="form-footer">
                  <label className="remember-me">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <button type="button" className="link-button">Forgot password?</button>
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Log In'}
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

            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="auth-form">
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
                  />
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <button 
                  type="button" 
                  className="link-button" 
                  onClick={() => setStep('input')}
                  disabled={loading}
                >
                  ← Change Login Method
                </button>
              </form>
            )}

            <div className="auth-switch">
              Don't have an account? <button className="link-btn" onClick={onSwitchToSignUp}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
