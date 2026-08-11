import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  Radar,
  TrendingUp,
  Settings,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  Cpu,
  Sparkles,
  RefreshCw,
  Clock,
  ChevronRight,
  Menu,
  X,
  UserCheck,
  Bell,
  GitBranch,
  Save,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useSession } from '../lib/auth-client.js';
import { fetchUserProfile, updateUserProfile, fetchDashboardSummary } from '../lib/api.js';

const Dashboard = ({ onNavigateToLanding }) => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState('sentinel/core-engine');

  // Profile Management State for Settings Tab
  const [profileData, setProfileData] = useState({
    firstName: 'Sarah',
    lastName: 'Vanderbilt',
    email: 'sarah.dev@sentinel.engineering',
    phone: '+1 (555) 234-8901',
    role: 'Engineering Manager (Project owner)'
  });

  const [weeklyReports, setWeeklyReports] = useState(true);
  const [githubSync, setGithubSync] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Sidebar Items (Strictly 5 items per Hick's Law)
  const navItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'Repositories', label: 'Repositories', icon: FolderGit2 },
    { id: 'Risk Radar', label: 'Risk Radar', icon: Radar },
    { id: 'Tech Debt', label: 'Tech Debt', icon: TrendingUp },
    { id: 'Settings', label: 'Settings', icon: Settings }
  ];

  // Fetch real profile data from database on mount & session change
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const data = await fetchUserProfile();
        if (isMounted && data) {
          setProfileData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            role: data.role || 'Engineering Manager (Project owner)'
          });
          setWeeklyReports(data.weeklyReports !== false);
          setGithubSync(data.githubSync !== false);
        }
      } catch (err) {
        console.warn('Using local fallback profile data:', err);
        if (session?.user && isMounted) {
          const parts = (session.user.name || '').split(' ');
          setProfileData((prev) => ({
            ...prev,
            firstName: parts[0] || prev.firstName,
            lastName: parts.slice(1).join(' ') || prev.lastName,
            email: session.user.email || prev.email
          }));
        }
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    };

    loadProfile();
    return () => { isMounted = false; };
  }, [session]);

  // Fetch dashboard metrics summary from backend
  useEffect(() => {
    let isMounted = true;
    const loadSummary = async () => {
      try {
        const data = await fetchDashboardSummary();
        if (isMounted && data) {
          setDashboardData(data);
        }
      } catch (err) {
        console.warn('Dashboard summary fetch fallback:', err);
      }
    };
    loadSummary();
    return () => { isMounted = false; };
  }, []);

  // Save changes to database via PUT endpoint
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updated = await updateUserProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        role: profileData.role,
        weeklyReports,
        githubSync
      });

      if (updated) {
        setProfileData({
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
          phone: updated.phone,
          role: updated.role
        });
        setWeeklyReports(updated.weeklyReports);
        setGithubSync(updated.githubSync);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3500);
    } catch (err) {
      console.error('Error saving profile changes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // High-Risk Modules Data
  const highRiskModules = dashboardData?.highRiskModules || [
    {
      path: 'src/auth/session.ts',
      riskScore: 84,
      churnLevel: 'High Churn (+420 lines)',
      status: 'Critical'
    },
    {
      path: 'src/api/payment_gateway.go',
      riskScore: 72,
      churnLevel: 'Unresolved State Retry',
      status: 'Warning'
    },
    {
      path: 'src/engine/planner.rs',
      riskScore: 61,
      churnLevel: 'Complex Cyclomatic Growth',
      status: 'Elevated'
    },
    {
      path: 'src/db/migrations/v4.sql',
      riskScore: 48,
      churnLevel: 'Schema Coupling Impact',
      status: 'Moderate'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f1412] text-[#dfe4de] font-sans antialiased flex flex-col md:flex-row selection:bg-[#b7f15b]/30 selection:text-[#b7f15b]">
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-[#181d1a] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateToLanding}>
          <div className="w-9 h-9 rounded-xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 flex items-center justify-center text-[#b7f15b]">
            <Radar className="w-5 h-5 animate-pulse" />
          </div>
          <span className="font-bold text-lg tracking-wider uppercase text-[#dfe4de]">Sentinel</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="min-w-[48px] min-h-[48px] p-2 flex items-center justify-center rounded-xl bg-[#1c211e] border border-white/10 text-[#dfe4de] hover:bg-white/10 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION (Constraint: Exactly 5 Primary Items) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#181d1a] border-r border-white/10 flex flex-col justify-between p-6 z-50 transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-8">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              if (onNavigateToLanding) onNavigateToLanding();
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#b7f15b]/15 border border-[#b7f15b]/40 flex items-center justify-center text-[#b7f15b] group-hover:scale-105 transition-transform">
              <Radar className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-xl tracking-wider uppercase text-[#dfe4de] group-hover:text-[#b7f15b] transition-colors">
                Sentinel
              </div>
              <div className="text-[10px] font-mono text-[#c3c9b2] tracking-widest uppercase">
                Predictive AI Node
              </div>
            </div>
          </div>

          {/* Navigation Items List */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full min-h-[48px] px-4 py-3 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center gap-3 transition-all duration-200 ${
                    isActive
                      ? 'bg-[#b7f15b] text-[#223600] font-bold shadow-lg shadow-[#b7f15b]/20 scale-[1.02]'
                      : 'text-[#c3c9b2] hover:text-[#dfe4de] hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#223600]' : 'text-[#8d937e]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Air-Gapped Security Badge */}
        <div className="p-4 rounded-2xl bg-[#1c211e] border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#b7f15b]">
            <ShieldCheck className="w-4 h-4 text-[#b7f15b]" />
            <span className="uppercase tracking-wider">Air-Gapped Node</span>
          </div>
          <p className="text-[11px] text-[#c3c9b2] leading-relaxed">
            Local SHAP inference active. 0 external network requests emitted.
          </p>
          <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-[#8d937e] border-t border-white/5">
            <span>MODEL 4.2-LOCAL</span>
            <span className="text-[#92d957]">99.8% READY</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 p-6 md:p-10 space-y-8 overflow-y-auto">
        {/* TOP BAR / HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-semibold text-[#dfe4de] tracking-tight">
                {activeTab === 'Dashboard' && 'Predictive Command Center'}
                {activeTab === 'Repositories' && 'Repository Graph Index'}
                {activeTab === 'Risk Radar' && 'Real-Time Telemetry Matrix'}
                {activeTab === 'Tech Debt' && 'Architectural Degradation Analysis'}
                {activeTab === 'Settings' && 'Profile & Workspace Preferences'}
              </h1>
              <span className="px-3 py-1 rounded-full bg-[#b7f15b]/10 border border-[#b7f15b]/30 text-[#b7f15b] text-xs font-mono font-bold uppercase tracking-wider">
                Live Scan Active
              </span>
            </div>
            <p className="text-sm text-[#c3c9b2] mt-1 font-mono">
              Engineering Knowledge Graph analysis for Sprint 42
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Repository Selector */}
            <div className="relative">
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="min-h-[48px] px-4 py-2 pr-10 rounded-xl bg-[#1c211e] border border-white/10 text-xs font-mono text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] transition-colors cursor-pointer appearance-none"
              >
                <option value="sentinel/core-engine">repo: sentinel/core-engine</option>
                <option value="sentinel/auth-service">repo: sentinel/auth-service</option>
                <option value="sentinel/billing-api">repo: sentinel/billing-api</option>
              </select>
              <FolderGit2 className="w-4 h-4 text-[#8d937e] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Quick Action Refresh */}
            <button
              className="min-w-[48px] min-h-[48px] p-3 rounded-xl bg-[#1c211e] border border-white/10 text-[#dfe4de] hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 text-xs font-mono uppercase"
              title="Trigger Instant AI Risk Scan"
            >
              <RefreshCw className="w-4 h-4 text-[#b7f15b]" />
              <span className="hidden sm:inline">Rescan Codebase</span>
            </button>
          </div>
        </header>

        {/* 1. DASHBOARD VIEW (MAIN BENTO GRID) */}
        {activeTab === 'Dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 animate-fadeIn">
            {/* WIDGET 1: Hero Metric - Overall Project Health Score */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-[#1c211e] border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#b7f15b]/5 rounded-full blur-3xl group-hover:bg-[#b7f15b]/10 transition-all pointer-events-none"></div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#c3c9b2] uppercase tracking-wider">
                  Overall Project Health
                </span>
                <div className="p-2 rounded-xl bg-[#b7f15b]/10 text-[#b7f15b]">
                  <Activity className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold tracking-tight text-[#dfe4de]">
                    {dashboardData?.healthScore || 78}
                  </span>
                  <span className="text-xl font-mono text-[#8d937e]">/100</span>
                  <span className="ml-auto px-2.5 py-1 rounded-full bg-[#92d957]/15 text-[#92d957] border border-[#92d957]/30 text-xs font-mono font-bold flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +{dashboardData?.healthScoreChange || 4.2}%
                  </span>
                </div>
                <p className="text-xs text-[#c3c9b2]">
                  Health score improved following modular refactoring in session cache layer.
                </p>
              </div>

              {/* Health Meter Sub-bars */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#c3c9b2]">Code Quality Stability</span>
                  <span className="text-[#b7f15b]">86%</span>
                </div>
                <div className="w-full bg-[#262b28] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#b7f15b] h-full rounded-full w-[86%]"></div>
                </div>

                <div className="flex justify-between text-[11px] font-mono pt-1">
                  <span className="text-[#c3c9b2]">Regression Shielding</span>
                  <span className="text-[#92d957]">74%</span>
                </div>
                <div className="w-full bg-[#262b28] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#92d957] h-full rounded-full w-[74%]"></div>
                </div>
              </div>
            </div>

            {/* WIDGET 3: Sprint Risk Forecast */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-[#1c211e] border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#c3c9b2] uppercase tracking-wider">
                  Sprint 42 Delay Probability
                </span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-4xl font-bold tracking-tight text-amber-400">
                    {dashboardData?.sprintRiskProbability || 76}%
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-mono uppercase font-bold">
                    High Risk of Delay
                  </span>
                </div>
                <div className="w-full bg-[#262b28] rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full w-[76%]"></div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#262b28] border border-white/5 space-y-1.5 text-xs">
                <div className="font-mono text-[#dfe4de] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Estimated Delay: +{dashboardData?.estimatedDelayDays || 2.5} Days</span>
                </div>
                <p className="text-[#c3c9b2] text-[11px] leading-relaxed">
                  Predicted bottlenecks in authentication token lifecycle merge conflict queue.
                </p>
              </div>
            </div>

            {/* KNOWLEDGE GRAPH SUB-CARD */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-[#1c211e] border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#c3c9b2] uppercase tracking-wider">
                  Knowledge Graph Ingestion
                </span>
                <div className="p-2 rounded-xl bg-[#b7f15b]/10 text-[#b7f15b]">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-2xl font-bold text-[#dfe4de]">
                  {dashboardData?.analyzedPRsCount || 4281} PRs Analyzed
                </div>
                <p className="text-xs text-[#c3c9b2]">
                  Mapping historical commit churn, file co-change frequency, and developer context switching.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#262b28] border border-white/5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-[#b7f15b]">
                  <span className="w-2 h-2 rounded-full bg-[#b7f15b] animate-ping"></span>
                  <span>{dashboardData?.knowledgeGraphStatus || 'GRAPH INDEX UP TO DATE'}</span>
                </div>
                <span className="text-[#8d937e]">12s ago</span>
              </div>
            </div>

            {/* WIDGET 4: Explainable AI / SHAP Insights (AI Reasoning Card) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-[#1c211e] border border-white/10 hover:border-white/20 transition-all duration-300 space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#b7f15b]/10 text-[#b7f15b]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#dfe4de]">AI Reasoning</h2>
                    <p className="text-xs font-mono text-[#c3c9b2]">Mathematically Grounded SHAP Attribution</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#181d1a] border border-white/10 text-xs font-mono text-[#8d937e]">
                  Confidence: 96.4%
                </span>
              </div>

              {/* Injected Text String Requirement */}
              <div className="p-5 rounded-xl bg-[#0a0f0c] border border-white/10 space-y-3 font-mono text-sm leading-relaxed text-[#dfe4de]">
                <div className="text-xs text-[#b7f15b] uppercase tracking-wider font-bold">
                  Local LLM Inference Synthesis:
                </div>
                <p className="text-[#dfe4de]/90">
                  &quot;{dashboardData?.aiReasoning || 'High risk of delay in auth module driven by excessive developer context-switching and complex tangled commits over the last 48 hours.'}&quot;
                </p>
              </div>

              {/* SHAP Factor Impact Breakdown */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-mono text-[#c3c9b2] uppercase tracking-wider">
                  Key Risk Driver Feature Contributions (SHAP Values)
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-[#dfe4de]">Developer Context Switching Churn</span>
                      <span className="text-[#ffb4ab] font-bold">+34% SHAP Impact</span>
                    </div>
                    <div className="w-full bg-[#262b28] rounded-full h-2">
                      <div className="bg-[#ffb4ab] h-full rounded-full w-[84%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-[#dfe4de]">Tangled Commits & High Cyclomatic Delta</span>
                      <span className="text-amber-300 font-bold">+28% SHAP Impact</span>
                    </div>
                    <div className="w-full bg-[#262b28] rounded-full h-2">
                      <div className="bg-amber-400 h-full rounded-full w-[68%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-[#dfe4de]">Untested Boundary Path Density</span>
                      <span className="text-[#92d957] font-bold">+18% SHAP Impact</span>
                    </div>
                    <div className="w-full bg-[#262b28] rounded-full h-2">
                      <div className="bg-[#92d957] h-full rounded-full w-[45%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WIDGET 2: AI Bug Predictions (Ranked List of High-Risk Modules) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#1c211e] border border-white/10 hover:border-white/20 transition-all duration-300 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#ffb4ab]/10 text-[#ffb4ab]">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#dfe4de]">High-Risk Modules</h2>
                    <p className="text-xs font-mono text-[#c3c9b2]">Predicted Failure Hotspots</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#8d937e] uppercase">Ranked</span>
              </div>

              {/* List of High Risk Modules */}
              <div className="space-y-3">
                {highRiskModules.map((module, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#181d1a] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="space-y-1 min-w-0 pr-3">
                      <div className="font-mono text-xs text-[#dfe4de] font-semibold truncate group-hover:text-[#b7f15b] transition-colors">
                        {module.path}
                      </div>
                      <div className="text-[11px] text-[#8d937e]">
                        {module.churnLevel}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                          module.riskScore >= 75
                            ? 'bg-[#ffb4ab]/15 text-[#ffb4ab] border border-[#ffb4ab]/30'
                            : module.riskScore >= 60
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-[#92d957]/15 text-[#92d957] border border-[#92d957]/30'
                        }`}
                      >
                        {module.riskScore}%
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#8d937e] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WIDGET 5: Tech Debt Hotspots (Team-level behavioral code analysis) */}
            <div className="lg:col-span-12 p-6 rounded-2xl bg-[#1c211e] border border-white/10 hover:border-white/20 transition-all duration-300 space-y-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#92d957]/10 text-[#92d957]">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#dfe4de]">Architectural Tech Debt Hotspots</h2>
                    <p className="text-xs font-mono text-[#c3c9b2]">
                      System-Level Behavioral Code Analysis (Aggregated Team Level)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#181d1a] border border-white/10 text-xs font-mono text-[#92d957]">
                    No Individual Tracking (Privacy Shield Active)
                  </span>
                </div>
              </div>

              {/* Grid Breakdown for Tech Debt */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#c3c9b2]">Coupling Index</span>
                    <span className="text-[#ffb4ab] font-bold">7.4 / 10 (HIGH)</span>
                  </div>
                  <h4 className="font-semibold text-sm text-[#dfe4de]">Auth & Caching Tight Coupling</h4>
                  <p className="text-xs text-[#c3c9b2] leading-relaxed">
                    Tangled imports between session verification and cache eviction logic are driving 62% of refactoring friction.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#c3c9b2]">Complexity Churn</span>
                    <span className="text-amber-300 font-bold">+18% This Sprint</span>
                  </div>
                  <h4 className="font-semibold text-sm text-[#dfe4de]">Payment Gateway Branching</h4>
                  <p className="text-xs text-[#c3c9b2] leading-relaxed">
                    Async webhook reconciliation handler has accumulated 14 conditional branches without isolated unit tests.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#c3c9b2]">Refactoring Priority</span>
                    <span className="text-[#b7f15b] font-bold">Recommended</span>
                  </div>
                  <h4 className="font-semibold text-sm text-[#dfe4de]">Extract Middleware Interface</h4>
                  <p className="text-xs text-[#c3c9b2] leading-relaxed">
                    Decoupling JWT token lifecycle will reduce predicted release risk for Sprint 43 by an estimated 32%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. SETTINGS TAB (REAL DATABASE CRUD INTEGRATION) */}
        {activeTab === 'Settings' && (
          <div className="max-w-4xl space-y-8 animate-fadeIn">
            {/* RBAC Read-Only Badge Header Card */}
            <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 flex items-center justify-center text-[#b7f15b]">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#dfe4de]">User Identity & Database Profile</h2>
                  <p className="text-xs font-mono text-[#c3c9b2] mt-0.5">
                    Synced with PostgreSQL table `tbl_user` via Express REST API.
                  </p>
                </div>
              </div>

              {/* READ-ONLY RBAC BADGE */}
              <div className="px-4 py-2 rounded-full bg-[#181d1a] border border-[#b7f15b]/30 text-[#b7f15b] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 w-fit">
                <ShieldCheck className="w-4 h-4 text-[#b7f15b]" />
                <span>Role: {profileData.role}</span>
              </div>
            </div>

            {saveSuccess && (
              <div className="p-4 rounded-2xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 text-[#b7f15b] flex items-center gap-3 text-sm font-mono animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Database profile successfully updated in PostgreSQL!</span>
              </div>
            )}

            {/* Profile Management Form with Database Sync */}
            <form onSubmit={handleProfileSave} className="p-6 md:p-8 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-6">
              <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#dfe4de]">Profile Details</h3>
                  <p className="text-xs text-[#c3c9b2] font-mono mt-1">
                    Manage identification and contact information stored in PostgreSQL.
                  </p>
                </div>
                {isLoadingProfile && (
                  <div className="flex items-center gap-2 text-xs font-mono text-[#b7f15b]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading DB Profile...</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block font-mono text-xs text-[#c3c9b2] uppercase mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="w-full min-h-[48px] px-4 rounded-xl bg-[#181d1a] border border-white/10 text-sm text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] transition-colors"
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block font-mono text-xs text-[#c3c9b2] uppercase mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="w-full min-h-[48px] px-4 rounded-xl bg-[#181d1a] border border-white/10 text-sm text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] transition-colors"
                    required
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block font-mono text-xs text-[#c3c9b2] uppercase mb-2">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full min-h-[48px] px-4 rounded-xl bg-[#181d1a] border border-white/10 text-sm text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] transition-colors"
                    required
                  />
                </div>

                {/* Phone Number (Optional) */}
                <div>
                  <label className="block font-mono text-xs text-[#c3c9b2] uppercase mb-2">
                    Phone Number <span className="text-[10px] text-[#8d937e] lowercase">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full min-h-[48px] px-4 rounded-xl bg-[#181d1a] border border-white/10 text-sm text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] transition-colors"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Role Selection (RBAC) */}
              <div>
                <label className="block font-mono text-xs text-[#c3c9b2] uppercase mb-2">
                  Access Control Role
                </label>
                <select
                  value={profileData.role}
                  onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                  className="w-full min-h-[48px] px-4 rounded-xl bg-[#181d1a] border border-white/10 text-sm text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] transition-colors cursor-pointer"
                >
                  <option value="Engineering Manager (Project owner)">Engineering Manager (Project owner)</option>
                  <option value="Software Engineer (Developer)">Software Engineer (Developer)</option>
                  <option value="Security Auditor (Read-Only)">Security Auditor (Read-Only)</option>
                </select>
              </div>

              {/* UI TOGGLES */}
              <div className="border-t border-white/10 pt-6 space-y-4">
                <h4 className="text-sm font-mono uppercase text-[#c3c9b2] tracking-wider">
                  Notification & Synchronization Preferences
                </h4>

                {/* Toggle 1: Receive Weekly Risk Reports */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#181d1a] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#b7f15b]/10 text-[#b7f15b]">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[#dfe4de]">Receive Weekly Risk Reports</div>
                      <div className="text-xs text-[#c3c9b2]">Automated SHAP AI summary delivered every Monday at 08:00 UTC.</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWeeklyReports(!weeklyReports)}
                    className={`min-w-[48px] min-h-[48px] p-2 rounded-full flex items-center transition-colors ${
                      weeklyReports ? 'bg-[#b7f15b]' : 'bg-[#262b28]'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full transition-transform ${
                        weeklyReports ? 'translate-x-4 bg-[#223600]' : 'translate-x-0 bg-[#8d937e]'
                      }`}
                    ></div>
                  </button>
                </div>

                {/* Toggle 2: GitHub Sync */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#181d1a] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#92d957]/10 text-[#92d957]">
                      <GitBranch className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[#dfe4de]">GitHub Sync</div>
                      <div className="text-xs text-[#c3c9b2]">Real-time webhook ingestion for PR status changes & commit graphs.</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGithubSync(!githubSync)}
                    className={`min-w-[48px] min-h-[48px] p-2 rounded-full flex items-center transition-colors ${
                      githubSync ? 'bg-[#b7f15b]' : 'bg-[#262b28]'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full transition-transform ${
                        githubSync ? 'translate-x-4 bg-[#223600]' : 'translate-x-0 bg-[#8d937e]'
                      }`}
                    ></div>
                  </button>
                </div>
              </div>

              {/* SAVE CHANGES CTA BUTTON (Lower-thumb zone) */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="min-h-[48px] px-8 rounded-full bg-[#b7f15b] text-[#223600] font-mono text-xs uppercase font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#b7f15b]/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isSaving ? 'Updating Database...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. PLACEHOLDER VIEWS FOR OTHER NAVIGATION TABS */}
        {activeTab === 'Repositories' && (
          <div className="p-12 rounded-2xl bg-[#1c211e] border border-white/10 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 flex items-center justify-center text-[#b7f15b] mx-auto">
              <FolderGit2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#dfe4de]">Repositories View</h3>
            <p className="text-sm text-[#c3c9b2] max-w-md mx-auto">
              Active Knowledge Graph ingestion across organization repositories connected via PostgreSQL.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#181d1a] border border-white/10 text-xs font-mono text-[#b7f15b]">
              <span>Status: Synchronized (14 Repos Ingested)</span>
            </div>
          </div>
        )}

        {activeTab === 'Risk Radar' && (
          <div className="p-12 rounded-2xl bg-[#1c211e] border border-white/10 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 flex items-center justify-center text-[#b7f15b] mx-auto">
              <Radar className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-[#dfe4de]">Risk Radar Telemetry Matrix</h3>
            <p className="text-sm text-[#c3c9b2] max-w-md mx-auto">
              Real-time heatmaps tracking defect probability density across active pull requests.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#181d1a] border border-white/10 text-xs font-mono text-[#92d957]">
              <span>Matrix Scan Velocity: 1,420 Lines/sec</span>
            </div>
          </div>
        )}

        {activeTab === 'Tech Debt' && (
          <div className="p-12 rounded-2xl bg-[#1c211e] border border-white/10 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 flex items-center justify-center text-[#b7f15b] mx-auto">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#dfe4de]">Tech Debt Architectural Hotspots</h3>
            <p className="text-sm text-[#c3c9b2] max-w-md mx-auto">
              Systemic behavioral code degradation insights and automated refactoring recommendations.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#181d1a] border border-white/10 text-xs font-mono text-[#b7f15b]">
              <span>Architectural Health Index: 78/100</span>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
