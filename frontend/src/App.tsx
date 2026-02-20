import { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import SignInPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import FarmerForm from './components/FarmerForm';
import Dashboard from './components/Dashboard';
import authService from './services/auth.service';
import type { Farmer } from './types';

type AppView = 'landing' | 'signin' | 'signup' | 'form' | 'dashboard';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [currentFarmer, setCurrentFarmer] = useState<Farmer | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      const user = authService.getCurrentUser();
      if (user) {
        // Convert backend user to frontend Farmer type
        setCurrentFarmer({
          name: user.name || '',
          phone: user.phone,
          state: user.state || '',
          district: user.district || '',
          landSize: user.landSize || 0,
          cropType: user.cropType || '',
        });
        setCurrentView('dashboard');
      }
    }
  }, []);

  const handleGetStarted = () => {
    setCurrentView('signup');
  };

  const handleSignIn = () => {
    setCurrentView('signin');
  };

  const handleSignUp = () => {
    setCurrentView('signup');
  };

  const handleSwitchToSignIn = () => {
    setCurrentView('signin');
  };

  const handleSwitchToSignUp = () => {
    setCurrentView('signup');
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    const user = authService.getCurrentUser();
    
    if (user && user.name && user.state && user.district && user.landSize && user.cropType) {
      // User has complete profile
      setCurrentFarmer({
        name: user.name,
        phone: user.phone,
        state: user.state,
        district: user.district,
        landSize: user.landSize,
        cropType: user.cropType,
      });
      setCurrentView('dashboard');
    } else {
      // User needs to complete profile (shouldn't happen with new flow, but fallback)
      setCurrentView('form');
    }
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handleFarmerSubmit = (farmer: Farmer) => {
    setCurrentFarmer(farmer);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentFarmer(null);
    setCurrentView('landing');
  };

  // Render based on current view
  if (currentView === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} onSignIn={handleSignIn} onSignUp={handleSignUp} />;
  }

  if (currentView === 'signin') {
    return <SignInPage onAuthSuccess={handleAuthSuccess} onBack={handleBackToLanding} onSwitchToSignUp={handleSwitchToSignUp} />;
  }

  if (currentView === 'signup') {
    return <SignUpPage onAuthSuccess={handleAuthSuccess} onBack={handleBackToLanding} onSwitchToSignIn={handleSwitchToSignIn} />;
  }

  if (currentView === 'form') {
    return (
      <div className="app">
        <FarmerForm onSubmit={handleFarmerSubmit} />
      </div>
    );
  }

  if (currentView === 'dashboard' && currentFarmer) {
    return (
      <div className="app">
        <Dashboard farmer={currentFarmer} onLogout={handleLogout} />
      </div>
    );
  }

  return null;
}

export default App;
