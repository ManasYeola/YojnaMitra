import './App.css';
import LandingPage from './components/LandingPage';
import PersonalizedDashboard from './components/PersonalizedDashboard';

function App() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const preview = params.get('preview');

  if (token || preview === '1') {
    return <PersonalizedDashboard />;
  }

  return <LandingPage />;
}

export default App;
