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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      const featuresEl = document.getElementById('features');
      const methodologyEl = document.getElementById('methodology');
      const securityEl = document.getElementById('security');

      const securityTop = securityEl ? securityEl.offsetTop - 150 : Infinity;
      const methodologyTop = methodologyEl ? methodologyEl.offsetTop - 150 : Infinity;
      const featuresTop = featuresEl ? featuresEl.offsetTop - 150 : Infinity;

      if (window.scrollY >= securityTop) {
        setActiveSection('security');
      } else if (window.scrollY >= methodologyTop) {
        setActiveSection('methodology');
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
      riskColor: 'bg-[#1F1F1F] text-[#ffb4ab] border border-[#ffb4ab]/30',
      shapExplanation: 'High complexity churn in authentication path (+420 lines). Similar changes historically caused 3 regressions in production jwt handling.',
      affectedModules: ['src/auth/jwt.ts', 'src/middleware/guard.ts']
    },
    {
      title: 'PR #398: Add async Stripe webhook reconciliation',
      author: '@alex_m',
      riskScore: 42,
      riskLevel: 'MODERATE RISK',
      riskColor: 'bg-[#1F1F1F] text-amber-400 border border-amber-400/30',
      shapExplanation: 'New webhook handler introduces unhandled retry state in queue worker under high race conditions.',
      affectedModules: ['src/billing/webhook.ts']
    },
    {
      title: 'PR #385: Optimize user session caching index',
      author: '@david_k',
      riskScore: 12,
      riskLevel: 'LOW RISK',
      riskColor: 'bg-[#0D2D29] text-[#2DD4BF] border border-[#2DD4BF]/30',
      shapExplanation: 'Isolated read-only query improvement with comprehensive unit test coverage and zero structural churn.',
      affectedModules: ['src/db/cache.ts']
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] selection:bg-accent/30">
      {/* TopNavBar */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-[64px] transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0A0A0A]/95 shadow-xl border-b border-[#262626] nav-blur'
            : 'bg-[#0A0A0A]/80 border-b border-[#171717] nav-blur'
        }`}
      >
        <div className="flex items-center gap-md cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img
            alt="Sentinel Logo"
            className="h-8 w-8 object-contain"
            src="https://lh3.googleusercontent.com/aida/AP1WRLvDf8kw0nSaa48w5mll2ZWC433iQBGUp7eLpuuEtJflrHMfox_NstZjA-SLO5syjZ5uW3kY-O25y9dz3FaxQby36fFp3sKEsbS2wJx0f9d9HeHnB_Mps2fk6YvrdFEC1MaXTxzov6FxgnLgX2SHMA6nTQccTu8Dh2pq0QfnYSYFzFCxsd81mlq_kf7RQ3lspSrgGU_BXOsxbO1oilOSDYTvQ9oFrViE1T29pImAom3XLeW_QCJ7XixrBwI"
          />
          <span className="font-headline-md text-[24px] font-bold tracking-tighter text-[#EDEDED]">
            Sentinel
          </span>
        </div>
        <div className="hidden md:flex items-center gap-xl">
          <a
            onClick={() => setActiveSection('features')}
            className={`font-body-md text-[16px] transition-colors duration-200 ${
              activeSection === 'features'
                ? 'text-accent font-bold'
                : 'text-[#8A8A8A] hover:text-[#EDEDED] font-normal'
            }`}
            href="#features"
          >
            Features
          </a>
          <a
            onClick={() => setActiveSection('methodology')}
            className={`font-body-md text-[16px] transition-colors duration-200 ${
              activeSection === 'methodology'
                ? 'text-accent font-bold'
                : 'text-[#8A8A8A] hover:text-[#EDEDED] font-normal'
            }`}
            href="#methodology"
          >
            Methodology
          </a>
          <a
            onClick={() => setActiveSection('security')}
            className={`font-body-md text-[16px] transition-colors duration-200 ${
              activeSection === 'security'
                ? 'text-accent font-bold'
                : 'text-[#8A8A8A] hover:text-[#EDEDED] font-normal'
            }`}
            href="#security"
          >
            Security
          </a>
        </div>
        <div className="flex items-center gap-md">
          {session ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2.5 px-3.5 h-[48px] rounded-[8px] bg-[#171717] border border-[#262626] text-[#EDEDED] text-[14px] font-medium shadow-sm">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User avatar'}
                    className="w-6 h-6 rounded-full object-cover border border-[#333333]"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/40 text-accent flex items-center justify-center font-bold text-xs">
                    {(session.user?.name || session.user?.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="max-w-[140px] truncate font-medium">
                  {session.user?.name || session.user?.email}
                </span>
              </div>
              <button
                onClick={async () => {
                  await authClient.signOut();
                }}
                className="h-[48px] px-4 font-label-md text-[14px] font-medium rounded-[8px] bg-[#1F1F1F] border border-[#262626] hover:bg-[#262626] hover:border-[#333333] text-[#A0A0A0] hover:text-[#EDEDED] transition-all active:scale-[0.98]"
                title="Sign out of Sentinel"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveModal('signup')}
              className="h-[48px] px-xl font-label-md text-[14px] font-semibold tracking-[0.01em] rounded-[8px] bg-[#EDEDED] text-[#0A0A0A] hover:bg-white active:scale-[0.98] transition-all shadow-lg shadow-white/5"
            >
              Get Started
            </button>
          )}
        </div>
      </nav>

      <main className="relative pt-[64px]">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-margin-mobile overflow-hidden">
          {/* Subtle Radial Glow Backdrop */}
          <div className="absolute inset-0 glow-radial pointer-events-none -z-10"></div>
          {/* Hero Content */}
          <div className="max-w-4xl mx-auto space-y-xl relative z-10">
            <h1 className="font-display-lg text-[40px] md:text-[64px] font-semibold text-[#EDEDED] leading-tight tracking-[-0.04em] max-w-5xl">
              Predict software engineering risks before they occur.
            </h1>
            <p className="font-body-lg text-[18px] text-[#8A8A8A] max-w-[600px] mx-auto leading-[28px]">
              Sentinel continuously studies your code, commits, and PRs to predict future engineering bottlenecks before they become expensive. Don't just report history—forecast your project's health.
            </p>
            <div className="pt-md flex flex-col md:flex-row items-center justify-center gap-md">
              <button
                onClick={() => setActiveModal('analyze')}
                className="h-[48px] px-xl rounded-[8px] bg-[#EDEDED] text-[#0A0A0A] font-semibold hover:bg-white active:scale-[0.98] transition-all duration-200 shadow-xl shadow-accent/5"
              >
                Analyze Project Health
              </button>
              <button
                onClick={() => setActiveModal('demo')}
                className="h-[48px] px-xl rounded-[8px] border border-[#262626] bg-[#171717] text-[#EDEDED] font-semibold hover:border-[#333333] hover:bg-[#1F1F1F] active:scale-[0.98] transition-all duration-200"
              >
                View Demo
              </button>
            </div>
          </div>
          {/* Dashboard Preview */}
          <div className="mt-xxl w-full max-w-6xl px-margin-mobile">
            <div
              onClick={() => setActiveModal('demo')}
              className="relative rounded-[16px] border border-[#262626] bg-[#111111] shadow-2xl overflow-hidden aspect-[16/9] flex items-center justify-center group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60 z-10"></div>
              <img
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-[1.02] transition-all duration-700"
                alt="A high-fidelity minimalist dashboard UI for a developer tool, showing dark-mode analytics, git commit activity graphs in teal, and a risk assessment heat map."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3iOGVevdcPPZBvEKfNMV4Ap2XHIYwU45pk1bSz77O9BE5wy6QD5kGLMEyob0-VuTUhCg8BiqX9PrE1zrQeRmorNV_nhaiAP5xnyxmmPly3G06hfg1wS_r4Ix3-XGbRWOqqko4mDEkyS0o_jA1Fn_nyKt1WpADYnD3hiQKvbgjjA51v-7ubsWLoUcnV0tOh4Osu2vtlrh3-pRKGlBuOmqco9XdE9Lk-ApTcMjihZGmJJd9p5qs67RkI1GZhGo21XaI2cjIP1GfWfU"
              />
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-accent/20 group-hover:border-accent transition-all duration-300">
                  <span className="material-symbols-outlined text-[#EDEDED] text-3xl">play_arrow</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section id="features" className="py-xxl max-w-7xl mx-auto px-margin-mobile">
          <div className="mb-xxl max-w-2xl">
            <h2 className="font-headline-lg text-[32px] font-medium tracking-[-0.02em] text-[#EDEDED] mb-md">Engineered for foresight.</h2>
            <p className="font-body-md text-[16px] text-[#8A8A8A]">
              Identify structural weaknesses and behavioral patterns that lead to production failures long before they hit the main branch.
            </p>
          </div>
          {/* The 24px Rule (gap-[24px]) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
            {/* Box 1 */}
            <div
              onMouseMove={handleMouseMove}
              onClick={() => setActiveModal('demo')}
              className="bento-card p-[24px] rounded-[16px] bg-[#171717] border border-[#262626] hover:border-[#333333] hover:border-t-accent/60 flex flex-col gap-md md:col-span-1 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-[8px] bg-accent/10 border border-accent/20 flex items-center justify-center mb-md group-hover:bg-accent/20 transition-colors">
                <span className="material-symbols-outlined text-accent">query_stats</span>
              </div>
              <h3 className="font-headline-md text-[24px] font-medium text-[#EDEDED]">Predict Bug Hotspots</h3>
              <p className="font-body-md text-[16px] text-[#8A8A8A]">
                Predict which files or modules are most likely to contain future defects before code is merged by analyzing historical churn and complexity.
              </p>
              <div className="mt-auto pt-xl">
                <img
                  className="w-full h-32 object-cover rounded-[8px] opacity-60 group-hover:opacity-90 transition-opacity"
                  alt="A detailed abstract visualization of software code modules represented as 3D blocks."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcAYTg2YAVyDdDkFc1FhrXY__w_b15bRc2bvK5PlmGtOtdfLayAurbgyVt0WP62oGtV8tDpsHc7GcjIoAeJ-i6gcGJALBrWrMT_vKaM7ke2Q0NM4GY3jY6ELnG9O0Ofu59L68uxBe42GzHAS1gMq6IRh3UOIJ1FH6GbYdF9u4zaOdNk__iWbe6nLCaiNYRch-FemBza70vpfoLbaOXmwfRqkZhTHEXDFyKTHjpcrR99qi3-OVIdxVQMiA6esQY3wH8tw63bAeXJqc"
                />
              </div>
            </div>
            {/* Box 2 */}
            <div
              onMouseMove={handleMouseMove}
              onClick={() => setActiveModal('demo')}
              className="bento-card p-[24px] rounded-[16px] bg-[#171717] border border-[#262626] hover:border-[#333333] hover:border-t-accent/60 flex flex-col gap-md md:col-span-1 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-[8px] bg-accent/10 border border-accent/20 flex items-center justify-center mb-md group-hover:bg-accent/20 transition-colors">
                <span className="material-symbols-outlined text-accent">trending_up</span>
              </div>
              <h3 className="font-headline-md text-[24px] font-medium text-[#EDEDED]">Forecast Technical Debt</h3>
              <p className="font-body-md text-[16px] text-[#8A8A8A]">
                Quantifies technical debt hotspots and ranks modules needing refactoring to reduce long-term maintenance costs and improve velocity.
              </p>
              <div className="mt-auto pt-xl">
                <img
                  className="w-full h-32 object-cover rounded-[8px] opacity-60 group-hover:opacity-90 transition-opacity"
                  alt="A clean, minimalist chart depicting an upward trend of technical debt versus team velocity."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2ql6XN3-inu5OxlSdbptPQvfcx0tHVhRQTLdsA9Ef8DuJ_6gHKy5X7OV9zxRLjj2u3pL4JyoeX_W2IcgYyZKnb7m6H3zo1-JJCW-JcFOvP0W0GetmEjgyK5U7rmyc0efZMwTNgRdjplHgAqTTJcChn_jIu4UqgL9JJpBE1vzt9-FiumKiK0jzV1CeP-JwirZ9AYySNWsWMdp4Dlo-Up5KYh9bDG5XdV4bjg6CR2ph-JjzxBKKzLHxwdjk0W_C-TTSvNNLCw-Zbic"
                />
              </div>
            </div>
            {/* Box 3 */}
            <div
              onMouseMove={handleMouseMove}
              onClick={() => setActiveModal('demo')}
              className="bento-card p-[24px] rounded-[16px] bg-[#171717] border border-[#262626] hover:border-[#333333] hover:border-t-accent/60 flex flex-col gap-md md:col-span-1 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-[8px] bg-accent/10 border border-accent/20 flex items-center justify-center mb-md group-hover:bg-accent/20 transition-colors">
                <span className="material-symbols-outlined text-accent">auto_awesome</span>
              </div>
              <h3 className="font-headline-md text-[24px] font-medium text-[#EDEDED]">Explainable AI (SHAP)</h3>
              <p className="font-body-md text-[16px] text-[#8A8A8A]">
                Generates mathematically grounded, natural-language justifications for every prediction using local LLMs for absolute clarity.
              </p>
              <div className="mt-auto pt-xl">
                <img
                  className="w-full h-32 object-cover rounded-[8px] opacity-60 group-hover:opacity-90 transition-opacity"
                  alt="A terminal-style window showing lines of code with overlaid natural language annotations explaining architectural risk."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUkdR3476bDMSJyLLCenQO_y8w-Ns_6CeJDUyUvnHE0aJ_2ODdhCTFFkvd3cxFy9ncH-e9Wz3g8LB5PLBKyQw6QRPjGUt2YTnQXFvqKGdxXNRtDjAELKpTzrjhSZk5cw1TqleuzRJ_D1y08pp7d_MZe1nk05nHXbIl1wM-pMe-6jX1rqZAVg8CNXfi6NLBhnwEorFTO6HnqEXwM-E8ge-qXtlfe0ryi-pzHABoKAyzGBnu2B2klhygj7Wx-gU_WoCiIVaSBUiK96E"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Methodology */}
        <section id="methodology" className="py-xxl border-y border-[#262626]/40 bg-[#0e0e0e]">
          <div className="max-w-3xl mx-auto px-margin-mobile text-center">
            <p className="font-body-md text-[16px] text-[#8A8A8A] leading-relaxed">
              Empirical benchmarks prove behavioral metrics are <span className="text-[#EDEDED] font-semibold">6x more accurate</span> than static analysis tools at predicting actual post-release issues.
            </p>
            <div className="mt-xl flex flex-wrap justify-center gap-xl opacity-40 grayscale filter">
              <span className="font-headline-md font-bold text-[#EDEDED] italic">Vercel</span>
              <span className="font-headline-md font-bold text-[#EDEDED] italic">OpenAI</span>
              <span className="font-headline-md font-bold text-[#EDEDED] italic">Coinbase</span>
              <span className="font-headline-md font-bold text-[#EDEDED] italic">Stripe</span>
            </div>
          </div>
        </section>

        {/* Risk Mitigation / Security */}
        <section id="security" className="py-xxl mt-xxl border-t border-[#262626]/40">
          <div className="max-w-7xl mx-auto px-margin-mobile flex flex-col md:flex-row items-center gap-xxl">
            <div className="flex-1 space-y-md">
              <div className="w-16 h-16 rounded-full bg-[#171717] border border-[#262626] flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-accent text-3xl">shield</span>
              </div>
              <h2 className="font-headline-lg text-[32px] font-medium tracking-[-0.02em] text-[#EDEDED]">Zero Data Leakage.</h2>
              <p className="font-body-lg text-[18px] text-[#8A8A8A] max-w-[540px] leading-[28px]">
                Sentinel maintains strict data security by executing completely offline on your local hardware—preventing external data leakage of your proprietary source code.
              </p>
              <ul className="space-y-sm">
                <li className="flex items-center gap-sm text-[#8A8A8A] font-body-md text-[16px]">
                  <span className="material-symbols-outlined text-accent text-sm">check_circle</span> 100% On-Premise Analysis
                </li>
                <li className="flex items-center gap-sm text-[#8A8A8A] font-body-md text-[16px]">
                  <span className="material-symbols-outlined text-accent text-sm">check_circle</span> No External Cloud Dependencies
                </li>
                <li className="flex items-center gap-sm text-[#8A8A8A] font-body-md text-[16px]">
                  <span className="material-symbols-outlined text-accent text-sm">check_circle</span> SOC2 Type II &amp; HIPAA Compliant
                </li>
              </ul>
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-accent/5 blur-3xl rounded-full"></div>
              <img
                className="relative z-10 w-full h-auto rounded-[16px] border border-[#262626]"
                alt="A high-tech server rack illustration with glowing teal status LEDs, representing secure on-premise hardware."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiQBYkgdDsltkuR3zLn2_53c_n5Oq3FOcViBtzmgm2RHnbZB97vQ_9CdGHL3d-EBE6l7SavKTo_k--DP1TpCyp8t2GKpRsIFcjRJS_q1AMT7zlZfhYScZgFMQMgNfM8TktU2HXVqaSq0mgxV1S3gpU0gryf5CbiTbaoI2_SNsoQGBgNx40opXbeegNWZoMNQkk9xLosLmWdRwyW15epk3qsnC58RK0kv3qeG7iid7w--dX-WrPCZ1HarXtzXAFw3QwozWuQQ6x4_k"
              />
            </div>
          </div>
        </section>

        {/* CTA Footer Section */}
        <section className="py-xxl bg-[#1c1b1b] text-center border-t border-[#262626]/40">
          <div className="max-w-3xl mx-auto px-margin-mobile py-xxl">
            <h2 className="font-display-lg text-[40px] md:text-[32px] font-medium text-[#EDEDED] mb-md">
              Ready to forecast your future?
            </h2>
            <p className="font-body-lg text-[18px] text-[#8A8A8A] mb-xl">
              Join the elite engineering teams using predictive intelligence to ship with confidence.
            </p>
            <button
              onClick={() => setActiveModal('signup')}
              className="h-[48px] px-xl rounded-[8px] bg-[#EDEDED] text-[#0A0A0A] font-bold text-lg hover:bg-white transition-all shadow-xl shadow-accent/5"
            >
              Start Free Trial
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-xxl flex flex-col items-center gap-md text-center max-w-7xl mx-auto px-margin-mobile border-t border-[#262626]/40">
        <div className="flex items-center gap-md mb-md">
          <img
            alt="Sentinel Logo"
            className="h-6 w-6 object-contain opacity-80"
            src="https://lh3.googleusercontent.com/aida/AP1WRLvDf8kw0nSaa48w5mll2ZWC433iQBGUp7eLpuuEtJflrHMfox_NstZjA-SLO5syjZ5uW3kY-O25y9dz3FaxQby36fFp3sKEsbS2wJx0f9d9HeHnB_Mps2fk6YvrdFEC1MaXTxzov6FxgnLgX2SHMA6nTQccTu8Dh2pq0QfnYSYFzFCxsd81mlq_kf7RQ3lspSrgGU_BXOsxbO1oilOSDYTvQ9oFrViE1T29pImAom3XLeW_QCJ7XixrBwI"
          />
          <span className="text-[24px] font-medium text-[#EDEDED]">Sentinel</span>
        </div>
        <div className="flex flex-wrap justify-center gap-xl mb-xl">
          <a className="font-label-md text-[14px] text-[#8A8A8A] hover:text-[#EDEDED] transition-colors duration-300" href="#features">
            Privacy Policy
          </a>
          <a className="font-label-md text-[14px] text-[#8A8A8A] hover:text-[#EDEDED] transition-colors duration-300" href="#features">
            Terms of Service
          </a>
          <a className="font-label-md text-[14px] text-[#8A8A8A] hover:text-[#EDEDED] transition-colors duration-300" href="#security">
            Security Whitepaper
          </a>
        </div>
        <p className="font-body-md text-[16px] text-[#8A8A8A] max-w-[540px]">
          Sentinel Intelligence Platform. Secured with end-to-end encryption.
        </p>
        <p className="font-label-md text-[14px] text-[#444748] mt-md">
          © 2024 Sentinel Corp. Built for the future of engineering.
        </p>
      </footer>

      {/* Interactive Modals */}
      {(activeModal === 'demo' || activeModal === 'analyze') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-[680px] bg-[#171717] rounded-[16px] border border-[#262626] shadow-2xl overflow-hidden p-6 md:p-8">
            {/* Modal Close Button */}
            <button
              onClick={() => {
                setActiveModal(null);
                setAnalyzeState('idle');
              }}
              className="absolute top-4 right-4 p-2 text-[#8A8A8A] hover:text-[#EDEDED] rounded-[8px] hover:bg-[#1F1F1F] transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* DEMO / SHAP EXPLAINABLE AI SIMULATOR */}
            {activeModal === 'demo' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[8px] bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-accent">query_stats</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-xl font-semibold text-[#EDEDED]">Live Risk Predictor Demo</h3>
                    <p className="text-sm text-[#8A8A8A]">Select a Pull Request to view Sentinel's SHAP risk forecast</p>
                  </div>
                </div>

                {/* PR Selectors */}
                <div className="flex flex-col gap-2">
                  {samplePRs.map((pr, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPR(idx)}
                      className={`text-left p-3 rounded-[8px] border transition-all flex items-center justify-between ${
                        selectedPR === idx
                          ? 'border-accent bg-accent/10'
                          : 'border-[#262626] bg-[#171717] hover:border-[#333333] hover:bg-[#1F1F1F]'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-[#EDEDED] text-sm">{pr.title}</div>
                        <div className="text-xs text-[#8A8A8A]">Author: {pr.author}</div>
                      </div>
                      <span className={`text-[12px] font-medium px-2 py-1 rounded-[4px] ${pr.riskColor}`}>
                        {pr.riskLevel} ({pr.riskScore}%)
                      </span>
                    </button>
                  ))}
                </div>

                {/* SHAP Explanation View */}
                <div className="p-4 rounded-[8px] bg-[#111111] border border-[#262626] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#262626] pb-2">
                    <span className="text-xs font-mono text-accent uppercase tracking-wider">SHAP AI Explanation</span>
                    <span className="text-xs text-[#8A8A8A]">Confidence: 96.4%</span>
                  </div>
                  <p className="text-sm text-slate-300 font-mono leading-relaxed">
                    {samplePRs[selectedPR].shapExplanation}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    {samplePRs[selectedPR].affectedModules.map((mod, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-[4px] bg-[#1F1F1F] text-slate-300 font-mono">
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="h-[48px] px-xl rounded-[8px] text-sm font-semibold bg-[#1F1F1F] hover:bg-[#262626] text-[#EDEDED] transition-colors"
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
                  <div className="w-10 h-10 rounded-[8px] bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-accent">radar</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-xl font-semibold text-[#EDEDED]">Analyze Project Health</h3>
                    <p className="text-sm text-[#8A8A8A]">Enter your repository to forecast technical risk</p>
                  </div>
                </div>

                {analyzeState === 'idle' && (
                  <form onSubmit={startAnalysis} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">GitHub / Gitlab Repository URL</label>
                      <input
                        type="text"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/org/repository"
                        className="w-full h-[48px] px-4 rounded-[8px] bg-[#111111] border border-[#262626] text-[#EDEDED] placeholder-[#8A8A8A] focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full h-[48px] rounded-[8px] bg-accent text-[#0A0A0A] font-semibold hover:bg-accent/90 transition-all"
                    >
                      Run Offline Prediction Scan
                    </button>
                  </form>
                )}

                {analyzeState === 'scanning' && (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <div className="font-semibold text-[#EDEDED]">Scanning repository commit graphs...</div>
                    <p className="text-xs text-[#8A8A8A]">Evaluating 4,281 historical pull requests with local SHAP models</p>
                  </div>
                )}

                {analyzeState === 'complete' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-[8px] bg-[#0D2D29] border border-[#2DD4BF]/30 text-[#2DD4BF] text-center">
                      <div className="font-bold text-lg mb-1">Scan Complete</div>
                      <div className="text-sm">Found 2 architectural risk hotspots in your repository.</div>
                    </div>
                    <div className="p-4 rounded-[8px] bg-[#111111] border border-[#262626] text-xs font-mono space-y-2">
                      <div className="text-accent">• src/engine/parser.ts — 78% regression probability</div>
                      <div className="text-amber-400">• src/api/handlers.go — 54% technical debt growth</div>
                    </div>
                    <button
                      onClick={() => {
                        setAnalyzeState('idle');
                        setActiveModal(null);
                      }}
                      className="w-full h-[48px] rounded-[8px] bg-[#EDEDED] text-[#0A0A0A] font-semibold hover:bg-white/90 transition-all"
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
