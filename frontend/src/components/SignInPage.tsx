import { useState } from 'react';
import authService from '../services/auth.service';
import '../styles/AuthPage.css';

interface SignInPageProps {
  onAuthSuccess: () => void;
  onBack: () => void;
  onSwitchToSignUp: () => void;
}

type SignInStep = 'phone' | 'otp';

function SignInPage({ onAuthSuccess, onBack, onSwitchToSignUp }: SignInPageProps) {
  const [step, setStep] = useState<SignInStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
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
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <button className="back-button" onClick={onBack}>← Back to Home</button>
        
        <div className="auth-card">
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-subtitle">
            {step === 'phone' 
              ? 'Enter your phone number to receive OTP' 
              : 'Enter the OTP sent to your phone'}
          </p>

          {error && <div className="auth-error">{error}</div>}

          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="auth-form">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
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

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="auth-form">
              <div className="form-group">
                <label htmlFor="otp">OTP</label>
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

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button 
                type="button" 
                className="auth-link-button" 
                onClick={() => setStep('phone')}
                disabled={loading}
              >
                Change Phone Number
              </button>
            </form>
          )}

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <button className="auth-link-button" onClick={onSwitchToSignUp}>
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
