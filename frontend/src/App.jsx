import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { useSession } from './lib/auth-client.js';

function AppContent() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  // If user is on landing page with an active session or ?view=dashboard, route to /dashboard
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('view') === 'dashboard' || (session?.user && location.pathname === '/')) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, location.search, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard defaultTab="Dashboard" />} />
        <Route path="/repositories" element={<Dashboard defaultTab="Repositories" />} />
        <Route path="/commits" element={<Dashboard defaultTab="Commits" />} />
        <Route path="/risk-radar" element={<Dashboard defaultTab="Risk Radar" />} />
        <Route path="/tech-debt" element={<Dashboard defaultTab="Tech Debt" />} />
        <Route path="/knowledge-graph" element={<Dashboard defaultTab="Knowledge Graph" />} />
        <Route path="/users" element={<Dashboard defaultTab="Users" />} />
        <Route path="/telemetry" element={<Dashboard defaultTab="Telemetry" />} />
        <Route path="/settings" element={<Dashboard defaultTab="Settings" />} />
        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;