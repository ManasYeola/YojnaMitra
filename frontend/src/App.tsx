import { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import SignInPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import FarmerForm from './components/FarmerForm';
import Dashboard from './components/Dashboard';
import FindSchemes from './components/FindSchemes';
import PersonalizedDashboard from './components/PersonalizedDashboard';
import authService from './services/auth.service';
import type { Farmer } from './types';

type AppView = 'landing' | 'signin' | 'signup' | 'form' | 'dashboard' | 'findSchemes';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [currentFarmer, setCurrentFarmer] = useState<Farmer | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if this is a personalized dashboard link (token in URL)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  // If token exists, show PersonalizedDashboard
  if (token) {
    return <PersonalizedDashboard />;
  }

  // Check if user is already authenticated on mount (but don't auto-redirect)
  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      const user = authService.getCurrentUser();
      if (user) {
        // Load user data but stay on landing page
        setCurrentFarmer({
          name: user.name || '',
          phone: user.phone,
          state: user.state || '',
          farmerType: user.farmerType,
          landOwnership: user.landOwnership,
          ageRange: user.ageRange,
          caste: user.caste,
          incomeRange: user.incomeRange,
          isBPL: user.isBPL,
          specialCategory: user.specialCategory,
        });
        // Don't auto-redirect - stay on landing page
        // User can click "Continue" to go to dashboard
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
    
    if (user && user.name && user.state && user.farmerType) {
      // User has complete profile
      setCurrentFarmer({
        name: user.name,
        phone: user.phone,
        state: user.state,
        farmerType: user.farmerType,
        landOwnership: user.landOwnership,
        ageRange: user.ageRange,
        caste: user.caste,
        incomeRange: user.incomeRange,
        isBPL: user.isBPL,
        specialCategory: user.specialCategory,
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

  const handleFindSchemes = () => {
    setCurrentView('findSchemes');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  // Render based on current view
  if (currentView === 'landing') {
    return (
      <LandingPage 
        onGetStarted={isAuthenticated ? () => setCurrentView('dashboard') : handleGetStarted} 
        onSignIn={handleSignIn} 
        onSignUp={handleSignUp}
        isAuthenticated={isAuthenticated}
        farmerName={currentFarmer?.name}
      />
    );
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
        <Dashboard farmer={currentFarmer} onLogout={handleLogout} onFindSchemes={handleFindSchemes} />
      </div>
    );
  }

  if (currentView === 'findSchemes') {
    return (
      <div className="app">
        <FindSchemes onBack={handleBackToDashboard} />
      </div>
    );
  }

  return null;
}

export default App;
