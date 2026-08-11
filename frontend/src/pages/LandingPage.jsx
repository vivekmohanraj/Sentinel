import React, { useState, useEffect } from 'react';
import AuthModal from '../components/AuthModal.jsx';
import { useSession, authClient } from '../lib/auth-client.js';

const LandingPage = () => {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('features');
  const [activeModal, setActiveModal] = useState(null); // 'signin', 'signup', 'demo', 'analyze'
  const [selectedPR, setSelectedPR] = useState(0);
  const [repoUrl, setRepoUrl] = useState('');
  const [analyzeState, setAnalyzeState] = useState('idle'); // 'idle', 'scanning', 'complete'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      const featuresEl = document.getElementById('features');
      const securityEl = document.getElementById('security');

      const securityTop = securityEl ? securityEl.offsetTop - 150 : Infinity;
      const featuresTop = featuresEl ? featuresEl.offsetTop - 150 : Infinity;

      if (window.scrollY >= securityTop) {
        setActiveSection('security');
      } else if (window.scrollY >= featuresTop) {
        setActiveSection('features');
      } else {
        setActiveSection('features');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const startAnalysis = (e) => {
    e.preventDefault();
    if (!repoUrl) return;
    setAnalyzeState('scanning');
    setTimeout(() => {
      setAnalyzeState('complete');
    }, 1800);
  };

  const samplePRs = [
    {
      title: 'PR #402: Refactor auth token lifecycle & middleware',
      author: '@sarah_dev',
      riskScore: 84,
      riskLevel: 'HIGH RISK',
      riskColor: 'bg-error/20 text-error border border-error/30',
      shapExplanation: 'High complexity churn in authentication path (+420 lines). Similar changes historically caused 3 regressions in production jwt handling.',
      affectedModules: ['src/auth/jwt.ts', 'src/middleware/guard.ts']
    },
    {
      title: 'PR #398: Add async Stripe webhook reconciliation',
      author: '@alex_m',
      riskScore: 42,
      riskLevel: 'MODERATE RISK',
      riskColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      shapExplanation: 'New webhook handler introduces unhandled retry state in queue worker under high race conditions.',
      affectedModules: ['src/billing/webhook.ts']
    },
    {
      title: 'PR #385: Optimize user session caching index',
      author: '@david_k',
      riskScore: 12,
      riskLevel: 'LOW RISK',
      riskColor: 'bg-surface-tint/20 text-surface-tint border border-surface-tint/30',
      shapExplanation: 'Isolated read-only query improvement with comprehensive unit test coverage and zero structural churn.',
      affectedModules: ['src/db/cache.ts']
    }
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container relative">
      {/* TopNavBar */}
      <nav
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-surface/90 backdrop-blur-3xl border-b border-white/10 shadow-2xl'
            : 'bg-surface/30 backdrop-blur-3xl border-b border-white/5'
        } flex justify-between items-center px-6 md:px-margin-safe py-4 max-w-container-max mx-auto`}
      >
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="material-symbols-outlined text-primary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            radar
          </span>
          <span className="text-headline-md font-headline-md font-bold tracking-tighter text-on-surface uppercase">
            Sentinel
          </span>
        </div>

        {/* Web Nav */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="#features"
            onClick={() => setActiveSection('features')}
            className={`font-label-caps text-label-caps uppercase rounded-full px-4 py-2 transition-colors ${
              activeSection === 'features'
                ? 'text-primary-container bg-white/5'
                : 'text-on-surface/70 hover:text-on-surface hover:bg-white/5'
            }`}
          >
            Intelligence
          </a>
          <a
            href="#security"
            onClick={() => setActiveSection('security')}
            className={`font-label-caps text-label-caps uppercase rounded-full px-4 py-2 transition-colors ${
              activeSection === 'security'
                ? 'text-primary-container bg-white/5'
                : 'text-on-surface/70 hover:text-on-surface hover:bg-white/5'
            }`}
          >
            Solutions
          </a>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3.5 h-[40px] rounded-full bg-surface-container-low border border-white/10 text-on-surface text-[14px]">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-6 h-6 rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center font-bold text-xs">
                    {(session.user?.name || session.user?.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="max-w-[120px] truncate font-medium">
                  {session.user?.name || session.user?.email}
                </span>
              </div>
              <button
                onClick={async () => {
                  await authClient.signOut();
                }}
                className="h-[40px] px-4 font-label-caps text-label-caps uppercase font-bold rounded-full bg-surface-container-high border border-white/10 hover:bg-white/10 text-on-surface/80 hover:text-on-surface transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveModal('signup')}
              className="hidden md:flex bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-label-caps text-label-caps uppercase font-bold hover:opacity-90 transition-opacity btn-primary"
            >
              Book Demo
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-on-surface p-2"
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[72px] bg-surface-container-low border-b border-white/10 p-6 flex flex-col gap-4 z-40 md:hidden animate-fadeIn">
          <a
            href="#features"
            onClick={() => {
              setActiveSection('features');
              setMobileMenuOpen(false);
            }}
            className="font-label-caps text-label-caps uppercase text-on-surface/80 py-2 border-b border-white/5"
          >
            Intelligence
          </a>
          <a
            href="#security"
            onClick={() => {
              setActiveSection('security');
              setMobileMenuOpen(false);
            }}
            className="font-label-caps text-label-caps uppercase text-on-surface/80 py-2 border-b border-white/5"
          >
            Solutions
          </a>
          {!session && (
            <button
              onClick={() => {
                setActiveModal('signup');
                setMobileMenuOpen(false);
              }}
              className="w-full mt-2 bg-primary-container text-on-primary-container py-3 rounded-full font-label-caps text-label-caps uppercase font-bold text-center"
            >
              Book Demo
            </button>
          )}
        </div>
      )}

      <main className="pt-28 md:pt-32 pb-24 relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="glow-effect glow-green w-[800px] h-[800px] top-[-200px] left-[-200px] opacity-60"></div>
        <div className="glow-effect glow-white w-[600px] h-[600px] top-[20%] right-[-100px] opacity-40"></div>

        {/* Hero Section */}
        <section className="max-w-container-max mx-auto px-6 md:px-margin-safe grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[780px]">
          {/* Left Content */}
          <div className="flex flex-col gap-8 z-10 fade-up">
            <div className="inline-flex items-center gap-2 glass-panel rounded-full px-4 py-2 w-fit border-white/10">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">
                Engineered for High-Stakes Codebases
              </span>
            </div>
            <h1 className="font-display-hero text-[36px] sm:text-[48px] lg:text-display-hero text-on-surface leading-tight">
              Predict the future of your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-secondary">
                codebase.
              </span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Sentinel analyzes your Engineering Knowledge Graph to forecast risks, technical debt, and sprint delays before they happen. Move from reactive fire-fighting to proactive engineering.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActiveModal('analyze')}
                className="bg-primary-container text-on-primary-container px-8 py-4 rounded-full font-label-caps text-label-caps font-bold uppercase btn-primary tracking-wider flex items-center gap-2"
              >
                Start Forecasting
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              <button
                onClick={() => setActiveModal('demo')}
                className="glass-panel px-8 py-4 rounded-full font-label-caps text-label-caps text-on-surface uppercase btn-glass flex items-center gap-2 border border-white/20"
              >
                <span className="material-symbols-outlined text-[18px]">play_circle</span>
                Watch Intelligence Demo
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/5 mt-4">
              <div>
                <div className="font-headline-md text-headline-md text-on-surface font-bold">500M+</div>
                <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mt-1">Commits Analyzed</div>
              </div>
              <div>
                <div className="font-headline-md text-headline-md text-on-surface font-bold">98%</div>
                <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mt-1">Prediction Accuracy</div>
              </div>
            </div>
          </div>

          {/* Right Visuals (Dashboard Preview) */}
          <div className="relative w-full h-[500px] lg:h-[600px] z-10 fade-up delay-200 perspective-[1000px]">
            <div
              onClick={() => setActiveModal('demo')}
              className="absolute inset-0 bg-surface-container-low rounded-[32px] md:rounded-[40px] border border-white/10 shadow-2xl overflow-hidden transform lg:rotate-y-[-5deg] lg:rotate-x-[5deg] scale-95 origin-center cursor-pointer group transition-transform duration-500 hover:scale-100"
            >
              {/* Fake UI Header */}
              <div className="h-14 border-b border-white/5 flex items-center px-6 gap-4 bg-surface/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/10"></div>
                  <div className="w-3 h-3 rounded-full bg-white/10"></div>
                  <div className="w-3 h-3 rounded-full bg-white/10"></div>
                </div>
                <div className="mx-auto font-label-caps text-label-caps text-on-surface-variant uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">lan</span>
                  Engineering Knowledge Graph
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 md:p-8 h-full flex flex-col gap-6 bg-gradient-to-b from-transparent to-surface-container-highest/20">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">Risk Heatmap</h3>
                    <p className="font-label-caps text-label-caps text-on-surface-variant mt-1 uppercase">Predicted for Sprint 42</p>
                  </div>
                  <span className="material-symbols-outlined text-primary-container">trending_up</span>
                </div>

                {/* Heatmap Grid */}
                <div className="grid grid-cols-2 gap-4 flex-1 pb-12">
                  {/* Module 1 */}
                  <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between border-l-4 border-l-error">
                    <div className="flex justify-between items-start">
                      <span className="font-data-point text-data-point text-on-surface">/core/auth</span>
                      <span className="px-2 py-1 bg-error/20 text-error rounded text-[10px] font-bold uppercase tracking-wider">High Risk</span>
                    </div>
                    <div>
                      <div className="text-[10px] text-on-surface-variant mb-1 uppercase font-label-caps">Debt Accumulation</div>
                      <div className="w-full bg-surface-bright rounded-full h-1">
                        <div className="bg-error h-1 rounded-full w-[85%]"></div>
                      </div>
                    </div>
                  </div>

                  {/* Module 2 */}
                  <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between border-l-4 border-l-surface-tint">
                    <div className="flex justify-between items-start">
                      <span className="font-data-point text-data-point text-on-surface">/api/v2</span>
                      <span className="px-2 py-1 bg-surface-tint/20 text-surface-tint rounded text-[10px] font-bold uppercase tracking-wider">Stable</span>
                    </div>
                    <div>
                      <div className="text-[10px] text-on-surface-variant mb-1 uppercase font-label-caps">Debt Accumulation</div>
                      <div className="w-full bg-surface-bright rounded-full h-1">
                        <div className="bg-surface-tint h-1 rounded-full w-[20%]"></div>
                      </div>
                    </div>
                  </div>

                  {/* Module 3 */}
                  <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between col-span-2 border-l-4 border-l-secondary">
                    <div className="flex justify-between items-center">
                      <span className="font-data-point text-data-point text-on-surface">/services/payment</span>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                        <span className="font-label-caps text-label-caps text-secondary uppercase">Optimized</span>
                      </div>
                    </div>
                    <div className="mt-4 h-12 w-full flex items-end gap-1 opacity-50">
                      <div className="w-full bg-secondary rounded-t-sm h-[30%]"></div>
                      <div className="w-full bg-secondary rounded-t-sm h-[40%]"></div>
                      <div className="w-full bg-secondary rounded-t-sm h-[20%]"></div>
                      <div className="w-full bg-secondary rounded-t-sm h-[60%]"></div>
                      <div className="w-full bg-secondary rounded-t-sm h-[10%]"></div>
                      <div className="w-full bg-secondary rounded-t-sm h-[5%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -right-4 md:-right-8 top-1/4 glass-panel p-4 rounded-2xl w-64 shadow-2xl border-white/20 transform translate-z-[50px] animate-[float_6s_ease-in-out_infinite] hidden sm:block">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-container text-[16px]">psychology</span>
                </div>
                <div className="font-label-caps text-label-caps text-on-surface uppercase">Prioritized Refactoring</div>
              </div>
              <div className="font-data-point text-data-point text-on-surface-variant text-sm mt-2">
                AI suggests focusing on auth.ts to prevent critical delay.
              </div>
            </div>

            <div className="absolute -left-4 md:-left-12 bottom-1/4 glass-panel p-4 rounded-2xl w-56 shadow-2xl border-white/20 transform translate-z-[80px] animate-[float_5s_ease-in-out_infinite_reverse] hidden sm:block">
              <div className="font-label-caps text-label-caps text-on-surface uppercase mb-3">Sprint Health Index</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-display-hero text-primary-container">92</span>
                <span className="font-data-point text-data-point text-on-surface-variant pb-1">/100</span>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="border-y border-white/5 bg-surface-container-lowest/50 py-12 mt-16">
          <div className="max-w-container-max mx-auto px-6 text-center">
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-8">
              Trusted by engineering teams at
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="font-headline-md font-bold text-on-surface tracking-tight italic">Vercel</span>
              <span className="font-headline-md font-bold text-on-surface tracking-tight italic">OpenAI</span>
              <span className="font-headline-md font-bold text-on-surface tracking-tight italic">Coinbase</span>
              <span className="font-headline-md font-bold text-on-surface tracking-tight italic">Stripe</span>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section id="features" className="py-24 max-w-container-max mx-auto px-6 md:px-margin-safe">
          <div className="mb-16 max-w-2xl">
            <div className="inline-flex items-center gap-2 glass-panel rounded-full px-4 py-1.5 w-fit border-white/10 mb-4">
              <span className="font-label-caps text-label-caps text-primary-container uppercase">Foresight Engine</span>
            </div>
            <h2 className="font-headline-lg text-[32px] md:text-headline-lg font-semibold tracking-tight text-on-surface mb-4">
              Engineered for foresight.
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Identify structural weaknesses and behavioral patterns that lead to production failures long before they hit the main branch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1 */}
            <div
              onMouseMove={handleMouseMove}
              onClick={() => setActiveModal('demo')}
              className="bento-card p-6 rounded-2xl flex flex-col justify-between cursor-pointer group min-h-[360px]"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mb-6 text-primary-container group-hover:bg-primary-container/20 transition-colors">
                  <span className="material-symbols-outlined">query_stats</span>
                </div>
                <h3 className="font-headline-md text-headline-md font-semibold text-on-surface mb-3">Predict Bug Hotspots</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Predict which files or modules are most likely to contain future defects before code is merged by analyzing historical churn and complexity.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-2 text-primary-container font-label-caps text-label-caps uppercase">
                <span>Explore Hotspot Mapping</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </div>

            {/* Box 2 */}
            <div
              onMouseMove={handleMouseMove}
              onClick={() => setActiveModal('demo')}
              className="bento-card p-6 rounded-2xl flex flex-col justify-between cursor-pointer group min-h-[360px]"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mb-6 text-primary-container group-hover:bg-primary-container/20 transition-colors">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <h3 className="font-headline-md text-headline-md font-semibold text-on-surface mb-3">Forecast Technical Debt</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Quantifies technical debt hotspots and ranks modules needing refactoring to reduce long-term maintenance costs and improve velocity.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-2 text-primary-container font-label-caps text-label-caps uppercase">
                <span>View Debt Forecaster</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </div>

            {/* Box 3 */}
            <div
              onMouseMove={handleMouseMove}
              onClick={() => setActiveModal('demo')}
              className="bento-card p-6 rounded-2xl flex flex-col justify-between cursor-pointer group min-h-[360px]"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mb-6 text-primary-container group-hover:bg-primary-container/20 transition-colors">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <h3 className="font-headline-md text-headline-md font-semibold text-on-surface mb-3">Explainable AI (SHAP)</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Generates mathematically grounded, natural-language justifications for every prediction using local LLMs for absolute clarity.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-2 text-primary-container font-label-caps text-label-caps uppercase">
                <span>Test SHAP Explanations</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="py-24 border-t border-white/5 bg-surface-container-lowest/30">
          <div className="max-w-container-max mx-auto px-6 md:px-margin-safe flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-white/10 flex items-center justify-center text-primary-container shadow-lg">
                <span className="material-symbols-outlined text-3xl">shield</span>
              </div>
              <h2 className="font-headline-lg text-[32px] md:text-headline-lg font-semibold tracking-tight text-on-surface">Zero Data Leakage.</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                Sentinel maintains strict data security by executing completely offline on your local hardware—preventing external data leakage of your proprietary source code.
              </p>
              <ul className="space-y-3 pt-2">
                <li className="flex items-center gap-3 text-on-surface-variant font-body-md">
                  <span className="material-symbols-outlined text-primary-container text-sm">check_circle</span> 100% On-Premise Analysis
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant font-body-md">
                  <span className="material-symbols-outlined text-primary-container text-sm">check_circle</span> No External Cloud Dependencies
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant font-body-md">
                  <span className="material-symbols-outlined text-primary-container text-sm">check_circle</span> SOC2 Type II &amp; HIPAA Compliant Architecture
                </li>
              </ul>
            </div>

            <div className="flex-1 w-full relative">
              <div className="glass-panel p-8 rounded-3xl border border-white/10 relative z-10 overflow-hidden">
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-primary-container animate-pulse"></span>
                    <span className="font-label-caps text-label-caps text-on-surface uppercase">On-Premise Node Active</span>
                  </div>
                  <span className="font-data-point text-data-point text-on-surface-variant">AIR-GAPPED</span>
                </div>
                <div className="py-8 space-y-4 font-data-point text-data-point">
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>MODEL ENGINE</span>
                    <span className="text-primary-container">LOCAL SHAP TRANSFORMER</span>
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>TELEMETRY OUTBOUND</span>
                    <span className="text-secondary">DISABLED (0 B/s)</span>
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>CODE GRAPH ENCRYPTION</span>
                    <span className="text-on-surface">AES-256 GCM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Footer Section */}
        <section className="py-24 bg-surface-container-low text-center border-t border-white/5 relative overflow-hidden">
          <div className="glow-effect glow-green w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30"></div>
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <h2 className="font-headline-lg text-[32px] md:text-headline-lg font-semibold text-on-surface mb-4">
              Ready to forecast your future?
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-xl mx-auto">
              Join the elite engineering teams using predictive intelligence to ship with confidence.
            </p>
            <button
              onClick={() => setActiveModal('signup')}
              className="bg-primary-container text-on-primary-container px-8 py-4 rounded-full font-label-caps text-label-caps font-bold uppercase btn-primary tracking-wider"
            >
              Start Free Trial
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest w-full border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 md:px-margin-safe py-16 max-w-container-max mx-auto">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                radar
              </span>
              <span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tighter uppercase">
                Sentinel
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
              © 2024 Sentinel Intelligence Systems. Engineered for high-stakes codebases.
            </p>
          </div>

          <div className="col-span-1 flex flex-col gap-3">
            <h4 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest mb-2">Product</h4>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100" href="#features">Documentation</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100" href="#features">Changelog</a>
          </div>

          <div className="col-span-1 flex flex-col gap-3">
            <h4 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest mb-2">Company</h4>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100" href="#security">Security</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100" href="#security">Privacy Policy</a>
          </div>

          <div className="col-span-1 flex flex-col gap-3">
            <h4 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest mb-2">Connect</h4>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100" href="https://github.com/vivekmohanraj/Sentinel" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100" href="#">LinkedIn</a>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      {(activeModal === 'demo' || activeModal === 'analyze') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-[680px] bg-surface-container-low rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-6 md:p-8">
            {/* Modal Close Button */}
            <button
              onClick={() => {
                setActiveModal(null);
                setAnalyzeState('idle');
              }}
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* DEMO / SHAP EXPLAINABLE AI SIMULATOR */}
            {activeModal === 'demo' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined">query_stats</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-xl font-semibold text-on-surface">Live Risk Predictor Demo</h3>
                    <p className="font-body-md text-xs text-on-surface-variant">Select a Pull Request to view Sentinel's SHAP risk forecast</p>
                  </div>
                </div>

                {/* PR Selectors */}
                <div className="flex flex-col gap-2">
                  {samplePRs.map((pr, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPR(idx)}
                      className={`text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        selectedPR === idx
                          ? 'border-primary-container bg-primary-container/10'
                          : 'border-white/10 bg-surface-container hover:border-white/20 hover:bg-surface-container-high'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-on-surface text-sm">{pr.title}</div>
                        <div className="font-data-point text-xs text-on-surface-variant mt-0.5">Author: {pr.author}</div>
                      </div>
                      <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full font-label-caps ${pr.riskColor}`}>
                        {pr.riskLevel} ({pr.riskScore}%)
                      </span>
                    </button>
                  ))}
                </div>

                {/* SHAP Explanation View */}
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-white/10 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-label-caps text-xs text-primary-container uppercase tracking-wider">SHAP AI Explanation</span>
                    <span className="font-data-point text-xs text-on-surface-variant">Confidence: 96.4%</span>
                  </div>
                  <p className="font-data-point text-sm text-on-surface/90 leading-relaxed">
                    {samplePRs[selectedPR].shapExplanation}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    {samplePRs[selectedPR].affectedModules.map((mod, i) => (
                      <span key={i} className="font-data-point text-xs px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant">
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="h-[44px] px-6 rounded-full font-label-caps text-label-caps uppercase font-bold bg-surface-container-high hover:bg-white/10 text-on-surface transition-colors"
                  >
                    Close Demo
                  </button>
                </div>
              </div>
            )}

            {/* ANALYZE PROJECT HEALTH MODAL */}
            {activeModal === 'analyze' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined">radar</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-xl font-semibold text-on-surface">Analyze Project Health</h3>
                    <p className="font-body-md text-xs text-on-surface-variant">Enter your repository to forecast technical risk</p>
                  </div>
                </div>

                {analyzeState === 'idle' && (
                  <form onSubmit={startAnalysis} className="space-y-4">
                    <div>
                      <label className="block font-label-caps text-xs text-on-surface-variant mb-2 uppercase">GitHub / GitLab Repository URL</label>
                      <input
                        type="text"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/org/repository"
                        className="w-full h-[48px] px-4 rounded-xl bg-surface-container border border-white/10 text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary-container"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full h-[48px] rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps font-bold uppercase btn-primary"
                    >
                      Run Offline Prediction Scan
                    </button>
                  </form>
                )}

                {analyzeState === 'scanning' && (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <div className="font-semibold text-on-surface">Scanning repository commit graphs...</div>
                    <p className="font-data-point text-xs text-on-surface-variant">Evaluating 4,281 historical pull requests with local SHAP models</p>
                  </div>
                )}

                {analyzeState === 'complete' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-primary-container/10 border border-primary-container/30 text-primary-container text-center">
                      <div className="font-bold text-lg mb-1">Scan Complete</div>
                      <div className="font-body-md text-sm">Found 2 architectural risk hotspots in your repository.</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-surface-container-lowest border border-white/10 font-data-point text-xs space-y-2">
                      <div className="text-primary-container">• src/engine/parser.ts — 78% regression probability</div>
                      <div className="text-amber-400">• src/api/handlers.go — 54% technical debt growth</div>
                    </div>
                    <button
                      onClick={() => {
                        setAnalyzeState('idle');
                        setActiveModal(null);
                      }}
                      className="w-full h-[48px] rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps font-bold uppercase btn-primary"
                    >
                      View Full Assessment Report
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Standalone Authentication Modal */}
      <AuthModal
        isOpen={activeModal === 'signin' || activeModal === 'signup'}
        initialSignUp={activeModal === 'signup'}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
};

export default LandingPage;

