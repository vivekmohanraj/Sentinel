import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { useSession } from './lib/auth-client.js';

function App() {
  const { data: session, isPending } = useSession();
  const [currentView, setCurrentView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'dashboard') return 'dashboard';
    return 'landing';
  });

  // Automatically transition to Dashboard when an active user session is established
  useEffect(() => {
    if (session?.user) {
      setCurrentView('dashboard');
    }
  }, [session]);

  const handleNavigateToLanding = () => {
    setCurrentView('landing');
    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const handleNavigateToDashboard = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      {currentView === 'dashboard' ? (
        <Dashboard onNavigateToLanding={handleNavigateToLanding} />
      ) : (
        <LandingPage onNavigateToDashboard={handleNavigateToDashboard} />
      )}
    </div>
  );
}

export default App;