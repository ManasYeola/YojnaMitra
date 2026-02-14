import { useState } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import FarmerForm from './components/FarmerForm';
import Dashboard from './components/Dashboard';
import type { Farmer } from './types';

function App() {
  const [currentFarmer, setCurrentFarmer] = useState<Farmer | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleFarmerSubmit = (farmer: Farmer) => {
    setCurrentFarmer(farmer);
  };

  const handleLogout = () => {
    setCurrentFarmer(null);
    setShowWelcome(true);
  };

  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  if (showWelcome && !currentFarmer) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="app">
      {!currentFarmer ? (
        <FarmerForm onSubmit={handleFarmerSubmit} />
      ) : (
        <Dashboard farmer={currentFarmer} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
