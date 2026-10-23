import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { useSession } from './lib/auth-client.js';

function AppContent() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle OAuth popup window completion and protected route redirection
  useEffect(() => {
    // If running inside an OAuth popup window, signal parent and close
    if (window.opener && window.opener !== window) {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has('error')) {
        try {
          window.opener.postMessage({ type: 'SENTINEL_AUTH_ERROR', error: searchParams.get('error') }, window.location.origin);
        } catch (e) {}
      } else {
        try {
          window.opener.postMessage({ type: 'SENTINEL_AUTH_SUCCESS' }, window.location.origin);
        } catch (e) {}
      }
      window.close();
      return;
    }

    const params = new URLSearchParams(location.search);
    const isDashboardRoute = location.pathname !== '/';

    // If on landing page with explicit view=dashboard param and verified session, route to /dashboard
    if (!isPending && session?.user && params.get('view') === 'dashboard') {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Strictly redirect away from all protected dashboard routes if user is not authenticated
    if (!isPending && !session?.user && isDashboardRoute) {
      navigate('/', { replace: true });
    }
  }, [session, isPending, location.search, location.pathname, navigate]);

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
        <Route path="/dora" element={<Dashboard defaultTab="DORA Metrics" />} />
        <Route path="/velocity" element={<Dashboard defaultTab="DORA Metrics" />} />
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