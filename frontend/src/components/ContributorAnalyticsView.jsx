import React, { useState, useEffect } from 'react';
import {
  Users,
  GitCommit,
  AlertTriangle,
  TrendingUp,
  Activity,
  Loader2,
  ChevronRight,
  BarChart3,
  ShieldAlert,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { fetchContributorAnalyticsApi } from '../lib/api.js';

const ContributorAnalyticsView = ({ selectedRepo, syncTrigger = 0 }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [expandedAuthor, setExpandedAuthor] = useState(null);

  const load = async (shouldSync = false) => {
    if (shouldSync) setIsSyncing(true);
    else setIsLoading(true);
    setFetchError(null);
    try {
      const result = await fetchContributorAnalyticsApi(selectedRepo, shouldSync);
      setData(result);
    } catch (err) {
      console.error('Failed to load contributor analytics:', err);
      setFetchError(err.message || 'Unable to connect to contributor analytics service');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    load();
  }, [selectedRepo, syncTrigger]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#b7f15b] animate-spin mx-auto" />
          <div className="text-sm font-mono text-[#c3c9b2]">Analyzing contributor patterns from mined git data…</div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-3 max-w-md">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <div className="text-sm font-mono text-[#c3c9b2]">{fetchError}</div>
        </div>
      </div>
    );
  }

  if (!data || data.totalCommits === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-3 max-w-md">
          <Users className="w-10 h-10 text-[#8d937e] mx-auto" />
          <div className="text-sm font-mono text-[#c3c9b2]">No mined commit data available for contributor analysis.</div>
          <div className="text-xs font-mono text-[#6b7160]">Add a repository and trigger a sync to begin analysis.</div>
        </div>
      </div>
    );
  }

  const busFactorColors = {
    Critical: { bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400' },
    High: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400' },
    Medium: { bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-400' },
    Low: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400' }
  };

  const bf = busFactorColors[data.busFactor.risk] || busFactorColors.Medium;

  const commitTypeColors = {
    fix: '#ef4444',
    feat: '#22c55e',
    refactor: '#a78bfa',
    test: '#60a5fa',
    perf: '#f59e0b',
    docs: '#6b7280',
    chore: '#94a3b8',
    improve: '#34d399',
    ci: '#818cf8',
    build: '#fb923c',
    style: '#f472b6',
    revert: '#f87171',
    hotfix: '#dc2626',
    bugfix: '#dc2626',
    other: '#6b7280'
  };

  // Compute the max bar width for the commit type chart
  const typeEntries = Object.entries(data.commitTypeDistribution || {}).sort((a, b) => b[1] - a[1]);
  const maxTypeCount = typeEntries.length > 0 ? typeEntries[0][1] : 1;

  // For the activity timeline sparkline
  const maxTimelineCommits = Math.max(...(data.activityTimeline || []).map(t => t.commits), 1);

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">

      {/* ─── Header Banner & Sync ─── */}
      <div className="p-4 rounded-2xl bg-[#1c211e] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#b7f15b]/10 text-[#b7f15b] border border-[#b7f15b]/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-[#dfe4de]">Engineering Contributor Topology & Bus Factor</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#b7f15b]/15 text-[#b7f15b] border border-[#b7f15b]/30 uppercase">
                PostgreSQL Mined Telemetry
              </span>
            </div>
            <p className="text-xs font-mono text-[#c3c9b2]/70 mt-0.5">
              Repository commit ownership, knowledge distribution, and churn metrics for <span className="text-[#b7f15b] font-bold">{selectedRepo || 'active repository'}</span>.
            </p>
          </div>
        </div>
        <button
          onClick={() => load(true)}
          disabled={isSyncing}
          className="px-3.5 py-2 rounded-xl bg-[#181d1a] hover:bg-white/5 border border-white/10 text-xs font-mono text-[#8d937e] hover:text-[#b7f15b] hover:border-[#b7f15b]/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          title="Re-mine commits from GitHub and update contributor analytics"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#b7f15b]' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Git'}</span>
        </button>
      </div>

      {/* ─── Top KPI Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Contributors',
            value: data.totalContributors,
            icon: Users,
            color: 'text-[#b7f15b]',
            bg: 'bg-[#b7f15b]/10',
            sub: `across ${data.totalCommits} commits`
          },
          {
            label: 'Bus Factor',
            value: data.busFactor.score,
            icon: ShieldAlert,
            color: bf.text,
            bg: bf.bg,
            sub: `${data.busFactor.risk} Risk`
          },
          {
            label: 'Total Churn',
            value: data.totalChurn.toLocaleString(),
            icon: Activity,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            sub: 'lines added + deleted'
          },
          {
            label: 'Peak Activity',
            value: data.peakActivityHour,
            icon: TrendingUp,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            sub: 'most active hour window'
          }
        ].map((kpi, i) => (
          <div key={i} className="p-4 rounded-2xl bg-[#1c211e] border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <div className={`text-xl font-bold font-mono ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[11px] font-mono text-[#8d937e] mt-1 uppercase tracking-wider">{kpi.label}</div>
            <div className="text-[10px] font-mono text-[#6b7160] mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ─── Bus Factor Warning Banner ─── */}
      {(data.busFactor.risk === 'Critical' || data.busFactor.risk === 'High') && (
        <div className={`p-4 rounded-2xl ${bf.bg} border ${bf.border} flex items-start gap-3`}>
          <ShieldAlert className={`w-5 h-5 ${bf.text} shrink-0 mt-0.5`} />
          <div>
            <div className={`text-sm font-bold font-mono ${bf.text}`}>
              Bus Factor Warning: {data.busFactor.risk} Risk
            </div>
            <div className="text-xs font-mono text-[#c3c9b2] mt-1 leading-relaxed">
              {data.busFactor.description}
            </div>
          </div>
        </div>
      )}

      {/* ─── Main Grid: Contributors Table + Sidebar ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Contributors Table (2/3 width on xl) */}
        <div className="xl:col-span-2 p-5 rounded-2xl bg-[#1c211e] border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[#b7f15b]" />
            <span className="text-sm font-bold font-mono text-[#dfe4de] uppercase tracking-wider">
              Contributor Ranking
            </span>
            <span className="text-xs font-mono text-[#8d937e] ml-auto">
              sorted by commit volume
            </span>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {data.contributors.map((c, idx) => {
              const isExpanded = expandedAuthor === c.email;
              const barWidth = Math.max(4, (c.commitShare / Math.max(...data.contributors.map(x => x.commitShare))) * 100);

              return (
                <div key={c.email}>
                  <button
                    onClick={() => setExpandedAuthor(isExpanded ? null : c.email)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isExpanded
                        ? 'bg-[#b7f15b]/10 border border-[#b7f15b]/20'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Badge */}
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
                        idx === 0 ? 'bg-[#b7f15b]/20 text-[#b7f15b]' :
                        idx === 1 ? 'bg-cyan-500/20 text-cyan-400' :
                        idx === 2 ? 'bg-purple-500/20 text-purple-400' :
                        'bg-white/5 text-[#8d937e]'
                      }`}>
                        {idx + 1}
                      </div>

                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#b7f15b]/30 to-emerald-500/30 flex items-center justify-center text-[11px] font-bold font-mono text-[#b7f15b] uppercase shrink-0 border border-white/10">
                        {c.displayName.substring(0, 2)}
                      </div>

                      {/* Name & Stats */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold font-mono text-[#dfe4de] truncate">{c.displayName}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                            commitTypeColors[c.topCommitType]
                              ? `bg-[${commitTypeColors[c.topCommitType]}]/10 text-[${commitTypeColors[c.topCommitType]}]`
                              : 'bg-white/5 text-[#8d937e]'
                          }`} style={{
                            backgroundColor: `${commitTypeColors[c.topCommitType] || '#6b7280'}15`,
                            color: commitTypeColors[c.topCommitType] || '#6b7280'
                          }}>
                            {c.topCommitType}
                          </span>
                        </div>
                        {/* Commit bar */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#b7f15b] to-emerald-500 transition-all duration-700"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-[#8d937e] w-14 text-right shrink-0">
                            {c.commits} cmt
                          </span>
                        </div>
                      </div>

                      {/* Share % */}
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold font-mono text-[#b7f15b]">{c.commitShare}%</div>
                        <div className="text-[10px] font-mono text-[#6b7160]">share</div>
                      </div>

                      <ChevronRight className={`w-4 h-4 text-[#6b7160] transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-4 py-3 ml-10 mr-4 mt-1 mb-2 rounded-xl bg-[#14181588] border border-white/5 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <div className="text-[10px] font-mono text-[#6b7160] uppercase">Lines Added</div>
                          <div className="text-sm font-bold font-mono text-emerald-400">+{c.linesAdded.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-[#6b7160] uppercase">Lines Deleted</div>
                          <div className="text-sm font-bold font-mono text-red-400">-{c.linesDeleted.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-[#6b7160] uppercase">Fix Ratio</div>
                          <div className={`text-sm font-bold font-mono ${c.fixRatio > 60 ? 'text-red-400' : c.fixRatio > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {c.fixRatio}%
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-[#6b7160] uppercase">Churn Share</div>
                          <div className="text-sm font-bold font-mono text-cyan-400">{c.churnShare}%</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8d937e]">
                          <GitCommit className="w-3 h-3" />
                          <span>{c.featureCommits} features</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8d937e]">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{c.fixCommits} fixes</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8d937e]">
                          <UserCheck className="w-3 h-3" />
                          <span>{c.activeDays} active day{c.activeDays !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Sidebar: Commit Type Distribution + Activity Timeline ─── */}
        <div className="space-y-6">

          {/* Commit Type Distribution */}
          <div className="p-5 rounded-2xl bg-[#1c211e] border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-[#b7f15b]" />
              <span className="text-sm font-bold font-mono text-[#dfe4de] uppercase tracking-wider">
                Commit Types
              </span>
            </div>

            <div className="space-y-2.5">
              {typeEntries.map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#c3c9b2] w-16 shrink-0 text-right">{type}</span>
                  <div className="flex-1 h-4 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(count / maxTypeCount) * 100}%`,
                        backgroundColor: commitTypeColors[type] || '#6b7280'
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold font-mono text-[#dfe4de] w-8 shrink-0">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline Sparkline */}
          <div className="p-5 rounded-2xl bg-[#1c211e] border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold font-mono text-[#dfe4de] uppercase tracking-wider">
                Activity Timeline
              </span>
            </div>

            <div className="flex items-end gap-1 h-24">
              {(data.activityTimeline || []).map((point, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative group cursor-pointer">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-[#b7f15b]/60 to-[#b7f15b] transition-all duration-500 hover:from-[#b7f15b]/80 hover:to-[#d4ff78]"
                      style={{
                        height: `${Math.max(4, (point.commits / maxTimelineCommits) * 80)}px`
                      }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                      <div className="bg-[#14181588] backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-center whitespace-nowrap">
                        <div className="text-xs font-bold font-mono text-[#b7f15b]">{point.commits} commits</div>
                        <div className="text-[10px] font-mono text-[#8d937e]">{point.activeAuthors} author{point.activeAuthors !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-[#6b7160] truncate w-full text-center">{point.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Contributors by Churn */}
          <div className="p-5 rounded-2xl bg-[#1c211e] border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold font-mono text-[#dfe4de] uppercase tracking-wider">
                Churn Leaders
              </span>
            </div>

            <div className="space-y-3">
              {(data.topContributorsByChurn || []).slice(0, 5).map((c, i) => (
                <div key={c.email} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold font-mono shrink-0 ${
                    i === 0 ? 'bg-purple-500/20 text-purple-400' :
                    i === 1 ? 'bg-purple-500/15 text-purple-300' :
                    'bg-white/5 text-[#8d937e]'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold font-mono text-[#dfe4de] truncate">{c.displayName}</div>
                    <div className="text-[10px] font-mono text-[#6b7160]">{c.totalChurn.toLocaleString()} lines churned</div>
                  </div>
                  <div className="text-xs font-bold font-mono text-purple-400 shrink-0">{c.churnShare}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributorAnalyticsView;
