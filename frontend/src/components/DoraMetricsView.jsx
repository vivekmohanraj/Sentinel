import React, { useState, useEffect } from 'react';
import {
  Gauge,
  Rocket,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Copy,
  Check,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { fetchDoraMetricsApi } from '../lib/api';

const TIER_COLORS = {
  Elite: {
    bg: 'bg-[#b7f15b]/15',
    text: 'text-[#b7f15b]',
    border: 'border-[#b7f15b]/30',
    bar: 'bg-[#b7f15b]',
    glow: 'shadow-[#b7f15b]/10'
  },
  High: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
    bar: 'bg-emerald-400',
    glow: 'shadow-emerald-500/10'
  },
  Medium: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    bar: 'bg-amber-400',
    glow: 'shadow-amber-500/10'
  },
  Low: {
    bg: 'bg-red-500/15',
    text: 'text-[#ffb4ab]',
    border: 'border-red-500/30',
    bar: 'bg-red-400',
    glow: 'shadow-red-500/10'
  }
};

const DoraMetricsView = ({ selectedRepo = '', userRole = 'Software Engineer (Developer)', onOpenPrPreCheck = null, syncTrigger = 0 }) => {
  const [doraData, setDoraData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const loadMetrics = async (shouldSync = false) => {
    if (shouldSync) setIsSyncing(true);
    else setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchDoraMetricsApi(selectedRepo, shouldSync);
      setDoraData(data);
    } catch (err) {
      console.error('Failed to load DORA metrics:', err);
      setFetchError(err.message || 'Unable to connect to DORA metrics service');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [selectedRepo, syncTrigger]);

  const handleCopySummary = () => {
    if (!doraData) return;
    const summary = `### SENTINEL DORA & VELOCITY AUDIT REPORT
Repository: ${doraData.repository?.name || selectedRepo || 'All'}
Overall Tier: ${doraData.overallTier} (${doraData.overallScore}/100)
1. Deployment Frequency: ${doraData.metrics?.deploymentFrequency?.valueText} [${doraData.metrics?.deploymentFrequency?.tier}]
2. Lead Time for Changes: ${doraData.metrics?.leadTimeForChanges?.valueText} [${doraData.metrics?.leadTimeForChanges?.tier}]
3. Change Failure Rate: ${doraData.metrics?.changeFailureRate?.valueText} [${doraData.metrics?.changeFailureRate?.tier}]
4. Mean Time to Recovery: ${doraData.metrics?.meanTimeToRecovery?.valueText} [${doraData.metrics?.meanTimeToRecovery?.tier}]
Feature Churn: ${doraData.velocity?.featureRatio}% | Remediation Churn: ${doraData.velocity?.hotfixRatio}%
Generated: ${new Date().toISOString()}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="p-12 rounded-2xl bg-[#1c211e] border border-white/10 flex flex-col items-center justify-center space-y-4 shadow-xl">
        <RefreshCw className="w-8 h-8 text-[#b7f15b] animate-spin" />
        <div className="text-sm font-mono text-[#c3c9b2]">Computing DORA cadence & commit telemetry...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-8 rounded-2xl bg-[#1c211e] border border-red-500/30 text-center space-y-4 shadow-xl">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h3 className="text-base font-bold text-[#dfe4de]">Telemetry Calculation Fault</h3>
        <p className="text-xs font-mono text-[#c3c9b2]">{fetchError}</p>
        <button
          onClick={() => loadMetrics(false)}
          className="px-4 py-2 rounded-xl bg-[#b7f15b] text-[#223600] font-mono text-xs font-bold uppercase hover:opacity-90 transition-all"
        >
          Retry Ingestion
        </button>
      </div>
    );
  }

  const { overallTier = 'Medium', overallScore = 70, summaryHeadline = '', metrics = {}, velocity = {}, recommendations = [] } = doraData || {};
  const overallColors = TIER_COLORS[overallTier] || TIER_COLORS.Medium;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HERO HEADER: DORA OVERALL MATURITY SCORECARD */}
      <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#b7f15b]/10 text-[#b7f15b] border border-[#b7f15b]/30">
                <Gauge className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-[#dfe4de]">DORA Delivery & Velocity Telemetry</h2>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${overallColors.bg} ${overallColors.text} ${overallColors.border}`}>
                    {overallTier} Tier
                  </span>
                </div>
                <p className="text-xs font-mono text-[#c3c9b2]/70 mt-0.5">
                  Standard DevOps Research and Assessment benchmarks derived from PostgreSQL commit stream for {selectedRepo || 'all repositories'}.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons & Score Meter */}
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-3 pr-4 border-r border-white/10">
              <div className="text-right font-mono">
                <div className="text-2xl font-bold text-[#dfe4de]">{overallScore}<span className="text-xs text-[#8d937e]">/100</span></div>
                <div className="text-[10px] text-[#c3c9b2] uppercase tracking-wider">Maturity Score</div>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-white/10 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 rounded-full border-4 border-[#b7f15b] transition-all duration-1000"
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${overallScore > 25 ? '100% 0%,' : ''} ${overallScore > 50 ? '100% 100%,' : ''} ${overallScore > 75 ? '0% 100%,' : ''} 0% 0%)`
                  }}
                />
                <Activity className="w-5 h-5 text-[#b7f15b]" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="px-3.5 py-2 rounded-xl bg-[#181d1a] hover:bg-white/5 border border-white/10 text-xs font-mono text-[#dfe4de] transition-colors flex items-center gap-2 cursor-pointer"
                title="Copy DORA metrics summary"
              >
                {copied ? <Check className="w-4 h-4 text-[#b7f15b]" /> : <Copy className="w-4 h-4 text-[#8d937e]" />}
                <span>{copied ? 'Copied' : 'Copy Audit'}</span>
              </button>
              <button
                onClick={() => loadMetrics(true)}
                disabled={isSyncing}
                className="px-3 py-2 rounded-xl bg-[#181d1a] hover:bg-white/5 border border-white/10 text-xs font-mono text-[#8d937e] hover:text-[#b7f15b] hover:border-[#b7f15b]/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Synchronize and re-mine repository commits from GitHub"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#b7f15b]' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Git'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tier Classification Banner */}
        <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5 text-[#dfe4de]">
            <Sparkles className="w-4 h-4 text-[#b7f15b] shrink-0" />
            <span><strong>Status Assessment:</strong> {summaryHeadline}</span>
          </div>
          <div className="text-[#8d937e] flex items-center gap-4 text-[11px]">
            <span>Active Contributors: <strong className="text-[#dfe4de]">{velocity.activeContributors || 0}</strong></span>
            <span>Analyzed Commits: <strong className="text-[#dfe4de]">{velocity.totalCommits || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. THE FOUR CORE DORA METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Deployment Frequency */}
        <div className="p-5 rounded-2xl bg-[#1c211e] border border-white/10 space-y-4 hover:border-[#b7f15b]/40 transition-all shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#c3c9b2]">
              <Rocket className="w-4 h-4 text-[#b7f15b]" />
              <span>DEPLOYMENT FREQ</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${TIER_COLORS[metrics.deploymentFrequency?.tier]?.bg || ''} ${TIER_COLORS[metrics.deploymentFrequency?.tier]?.text || ''} ${TIER_COLORS[metrics.deploymentFrequency?.tier]?.border || ''}`}>
              {metrics.deploymentFrequency?.tier || 'Medium'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-bold font-mono text-[#dfe4de]">
              {metrics.deploymentFrequency?.valueText || '0 / wk'}
            </div>
            <div className="text-[11px] font-mono text-[#8d937e]">
              Target: <span className="text-[#c3c9b2]">{metrics.deploymentFrequency?.benchmark}</span>
            </div>
          </div>

          {/* Tier visual meter */}
          <div className="space-y-1 pt-2 border-t border-white/5">
            <div className="flex justify-between text-[10px] font-mono text-[#8d937e]">
              <span>Cadence tier</span>
              <span>{metrics.deploymentFrequency?.tier}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden flex gap-1">
              <div className={`h-full flex-1 rounded-full ${['Low', 'Medium', 'High', 'Elite'].indexOf(metrics.deploymentFrequency?.tier) >= 0 ? 'bg-red-400/80' : 'bg-white/10'}`} />
              <div className={`h-full flex-1 rounded-full ${['Medium', 'High', 'Elite'].indexOf(metrics.deploymentFrequency?.tier) >= 0 ? 'bg-amber-400/80' : 'bg-white/10'}`} />
              <div className={`h-full flex-1 rounded-full ${['High', 'Elite'].indexOf(metrics.deploymentFrequency?.tier) >= 0 ? 'bg-emerald-400/80' : 'bg-white/10'}`} />
              <div className={`h-full flex-1 rounded-full ${metrics.deploymentFrequency?.tier === 'Elite' ? 'bg-[#b7f15b]' : 'bg-white/10'}`} />
            </div>
          </div>

          <p className="text-[11px] text-[#c3c9b2]/70 leading-relaxed font-mono">
            {metrics.deploymentFrequency?.description}
          </p>
        </div>

        {/* Metric 2: Lead Time for Changes */}
        <div className="p-5 rounded-2xl bg-[#1c211e] border border-white/10 space-y-4 hover:border-[#b7f15b]/40 transition-all shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#c3c9b2]">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>LEAD TIME FOR CHANGES</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${TIER_COLORS[metrics.leadTimeForChanges?.tier]?.bg || ''} ${TIER_COLORS[metrics.leadTimeForChanges?.tier]?.text || ''} ${TIER_COLORS[metrics.leadTimeForChanges?.tier]?.border || ''}`}>
              {metrics.leadTimeForChanges?.tier || 'High'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-bold font-mono text-[#dfe4de]">
              {metrics.leadTimeForChanges?.valueText || '24.0 hrs'}
            </div>
            <div className="text-[11px] font-mono text-[#8d937e]">
              Target: <span className="text-[#c3c9b2]">{metrics.leadTimeForChanges?.benchmark}</span>
            </div>
          </div>

          {/* Tier visual meter */}
          <div className="space-y-1 pt-2 border-t border-white/5">
            <div className="flex justify-between text-[10px] font-mono text-[#8d937e]">
              <span>Turnaround tier</span>
              <span>{metrics.leadTimeForChanges?.tier}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden flex gap-1">
              <div className={`h-full flex-1 rounded-full ${['Low', 'Medium', 'High', 'Elite'].indexOf(metrics.leadTimeForChanges?.tier) >= 0 ? 'bg-red-400/80' : 'bg-white/10'}`} />
              <div className={`h-full flex-1 rounded-full ${['Medium', 'High', 'Elite'].indexOf(metrics.leadTimeForChanges?.tier) >= 0 ? 'bg-amber-400/80' : 'bg-white/10'}`} />
              <div className={`h-full flex-1 rounded-full ${['High', 'Elite'].indexOf(metrics.leadTimeForChanges?.tier) >= 0 ? 'bg-emerald-400/80' : 'bg-white/10'}`} />
              <div className={`h-full flex-1 rounded-full ${metrics.leadTimeForChanges?.tier === 'Elite' ? 'bg-[#b7f15b]' : 'bg-white/10'}`} />
            </div>
          </div>

          <p className="text-[11px] text-[#c3c9b2]/70 leading-relaxed font-mono">
            {metrics.leadTimeForChanges?.description}
          </p>
        </div>

        {/* Metric 3: Change Failure Rate */}
        <div className="p-5 rounded-2xl bg-[#1c211e] border border-white/10 space-y-4 hover:border-[#b7f15b]/40 transition-all shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#c3c9b2]">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>CHANGE FAILURE RATE</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${TIER_COLORS[metrics.changeFailureRate?.tier]?.bg || ''} ${TIER_COLORS[metrics.changeFailureRate?.tier]?.text || ''} ${TIER_COLORS[metrics.changeFailureRate?.tier]?.border || ''}`}>
              {metrics.changeFailureRate?.tier || 'Elite'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-bold font-mono text-[#dfe4de]">
              {metrics.changeFailureRate?.valueText || '0.0%'}
            </div>
            <div className="text-[11px] font-mono text-[#8d937e]">
              Target: <span className="text-[#c3c9b2]">{metrics.changeFailureRate?.benchmark}</span>
            </div>
          </div>

          {/* Tier visual meter */}
          <div className="space-y-1 pt-2 border-t border-white/5">
            <div className="flex justify-between text-[10px] font-mono text-[#8d937e]">
              <span>Stability tier</span>
              <span>{metrics.changeFailureRate?.tier}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden flex gap-1">
              <div className={`h-full flex-1 rounded-full ${['Low', 'Medium', 'High', 'Elite'].indexOf(metrics.changeFailureRate?.tier) >= 0 ? 'bg-red-400/80' : 'bg-white/10'}`} />
              <div className={`h-full flex-1 rounded-full ${['Medium', 'High', 'Elite'].indexOf(metrics.changeFailureRate?.tier) >= 0 ? 'bg-amber-400/80' : 'bg-white/10'}`} />
              <div className={`h-full flex-1 rounded-full ${['High', 'Elite'].indexOf(metrics.changeFailureRate?.tier) >= 0 ? 'bg-emerald-400/80' : 'bg-white/10'}`} />
              <div className={`h-full flex-1 rounded-full ${metrics.changeFailureRate?.tier === 'Elite' ? 'bg-[#b7f15b]' : 'bg-white/10'}`} />
            </div>
          </div>

          <p className="text-[11px] text-[#c3c9b2]/70 leading-relaxed font-mono">
            {metrics.changeFailureRate?.description}
          </p>
        </div>

        {/* Metric 4: Mean Time to Recovery */}
        <div className="p-5 rounded-2xl bg-[#1c211e] border border-white/10 space-y-4 hover:border-[#b7f15b]/40 transition-all shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#c3c9b2]">
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>MEAN TIME TO RECOVERY</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${TIER_COLORS[metrics.meanTimeToRecovery?.tier]?.bg || ''} ${TIER_COLORS[metrics.meanTimeToRecovery?.tier]?.text || ''} ${TIER_COLORS[metrics.meanTimeToRecovery?.tier]?.border || ''}`}>
              {metrics.meanTimeToRecovery?.tier || 'High'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-bold font-mono text-[#dfe4de]">
              {metrics.meanTimeToRecovery?.valueText || '2.0 hrs'}
            </div>
            <div className="text-[11px] font-mono text-[#8d937e]">
              Target: <span className="text-[#c3c9b2]">{metrics.meanTimeToRecovery?.benchmark}</span>
            </div>
          </div>

          {/* Tier visual meter */}
          <div className="space-y-1 pt-2 border-t border-white/5">
            <div className="flex justify-between text-[10px] font-mono text-[#8d937e]">
              <span>Recovery tier</span>
              <span>{metrics.meanTimeToRecovery?.tier}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden flex gap-1">
              <div className={`h-full flex-1 rounded-full ${['Low', 'Medium', 'High', 'Elite'].indexOf(metrics.meanTimeToRecovery?.tier) >= 0 ? 'bg-red-400/80' : 'bg-white/10'}`} />
              <div className={`h-full flex-1 rounded-full ${['Medium', 'High', 'Elite'].indexOf(metrics.meanTimeToRecovery?.tier) >= 0 ? 'bg-amber-400/80' : 'bg-white/10'}`} />
              <div className={`h-full flex-1 rounded-full ${['High', 'Elite'].indexOf(metrics.meanTimeToRecovery?.tier) >= 0 ? 'bg-emerald-400/80' : 'bg-white/10'}`} />
              <div className={`h-full flex-1 rounded-full ${metrics.meanTimeToRecovery?.tier === 'Elite' ? 'bg-[#b7f15b]' : 'bg-white/10'}`} />
            </div>
          </div>

          <p className="text-[11px] text-[#c3c9b2]/70 leading-relaxed font-mono">
            {metrics.meanTimeToRecovery?.description}
          </p>
        </div>
      </div>

      {/* 3. SECTION 2: VELOCITY CHURN RATIO & SPRINT CADENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Feature vs Hotfix Churn Ratio */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#1c211e] border border-white/10 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#b7f15b]/10 text-[#b7f15b]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#dfe4de]">Engineering Churn Composition</h3>
                <p className="text-xs font-mono text-[#c3c9b2]">Ratio of new feature code vs hotfix defect remediation</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#b7f15b]">
              {velocity.featureRatio}% Feature
            </span>
          </div>

          {/* Stacked Progress Bar */}
          <div className="space-y-3">
            <div className="w-full h-4 rounded-xl bg-white/5 overflow-hidden flex">
              <div
                style={{ width: `${velocity.featureRatio || 85}%` }}
                className="h-full bg-[#b7f15b] hover:opacity-90 transition-all relative group cursor-pointer"
                title={`Feature development: ${velocity.featureRatio}%`}
              />
              <div
                style={{ width: `${velocity.hotfixRatio || 15}%` }}
                className="h-full bg-amber-400 hover:opacity-90 transition-all relative group cursor-pointer"
                title={`Hotfix remediation: ${velocity.hotfixRatio}%`}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#b7f15b]" />
                <span className="text-[#dfe4de]">Feature Evolution ({velocity.featureRatio}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-amber-300">Hotfix / Defect Churn ({velocity.hotfixRatio}%)</span>
              </div>
            </div>
          </div>

          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-[#181d1a] border border-white/5 space-y-1">
              <div className="text-[11px] font-mono text-[#8d937e]">GROSS CODE ADDITIONS</div>
              <div className="text-lg font-bold font-mono text-[#b7f15b]">+{velocity.totalLinesAdded || 0} LoC</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#181d1a] border border-white/5 space-y-1">
              <div className="text-[11px] font-mono text-[#8d937e]">REFACTORED DELETIONS</div>
              <div className="text-lg font-bold font-mono text-[#ffb4ab]">-{velocity.totalLinesDeleted || 0} LoC</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#262b28] border border-white/5 flex items-center gap-2 text-xs font-mono text-[#c3c9b2]">
            <ShieldCheck className="w-4 h-4 text-[#b7f15b] shrink-0" />
            <span>Goodhart's Law: Churn breakdown is aggregated across repository modules to safeguard developer autonomy.</span>
          </div>
        </div>

        {/* Weekly Throughput Cadence */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#1c211e] border border-white/10 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#dfe4de]">Weekly Delivery Throughput</h3>
                <p className="text-xs font-mono text-[#c3c9b2]">Aggregated commit volume and defect fixes over past 6 weeks</p>
              </div>
            </div>
          </div>

          {/* Throughput Bars */}
          <div className="space-y-3">
            {velocity.weeklyThroughput && velocity.weeklyThroughput.length > 0 ? (
              <div className="space-y-2">
                {velocity.weeklyThroughput.map((week, idx) => {
                  const maxCommits = Math.max(1, ...velocity.weeklyThroughput.map(w => w.commits));
                  const pct = Math.max(8, Math.round((week.commits / maxCommits) * 100));

                  return (
                    <div key={idx} className="flex items-center gap-3 text-xs font-mono">
                      <span className="w-16 text-[#8d937e] text-right shrink-0">{week.week}</span>
                      <div className="flex-1 h-6 rounded-lg bg-white/5 overflow-hidden flex items-center p-1 relative">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full rounded bg-gradient-to-r from-cyan-500/80 to-[#b7f15b] transition-all flex items-center justify-end px-2"
                        >
                          <span className="text-[10px] font-bold text-[#223600]">{week.commits}</span>
                        </div>
                      </div>
                      <span className="w-16 text-right text-[11px] text-[#c3c9b2]">
                        {week.fixes > 0 ? (
                          <span className="text-amber-400">{week.fixes} fixes</span>
                        ) : (
                          <span className="text-[#8d937e]">clean</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs font-mono text-[#8d937e]">
                No weekly commit history recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. SECTION 3: CONTINUOUS IMPROVEMENT ADVISORY */}
      <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#b7f15b]/10 text-[#b7f15b] border border-[#b7f15b]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#dfe4de]">DORA Continuous Improvement Roadmap</h3>
              <p className="text-xs font-mono text-[#c3c9b2]">Prescriptive recommendations to advance your team to the next DORA tier</p>
            </div>
          </div>
          {onOpenPrPreCheck && (
            <button
              onClick={onOpenPrPreCheck}
              className="px-3.5 py-1.5 rounded-xl bg-[#b7f15b]/15 hover:bg-[#b7f15b]/25 border border-[#b7f15b]/30 text-[#b7f15b] text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Run Branch Pre-Check</span>
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {recommendations.map((rec, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-[#181d1a] border border-white/5 flex items-start gap-3 text-xs font-mono text-[#dfe4de]">
              <CheckCircle2 className="w-4 h-4 text-[#b7f15b] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoraMetricsView;
