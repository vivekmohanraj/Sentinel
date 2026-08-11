import React, { useState } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard'

  return (
    <div className="min-h-screen bg-background text-on-background">
      {currentView === 'dashboard' ? (
        <Dashboard onNavigateToLanding={() => setCurrentView('landing')} />
      ) : (
        <LandingPage onNavigateToDashboard={() => setCurrentView('dashboard')} />
      )}
    </div>
  );
}

export default App;