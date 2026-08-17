import React, { useState, useEffect } from 'react';
import { X, Users, ShieldAlert, UserCheck, Activity, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { fetchBusFactorMetricsApi } from '../lib/api';

const BusFactorDrawer = ({ isOpen, onClose, selectedRepo = 'sentinel/core-engine' }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchBusFactorMetricsApi(selectedRepo)
        .then((res) => {
          setData(res);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load Bus Factor metrics:', err);
          setIsLoading(false);
        });
    }
  }, [isOpen, selectedRepo]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl h-full bg-[#1c211e] border-l border-white/10 shadow-2xl flex flex-col space-y-0">
        {/* Drawer Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#181d1a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Users className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#dfe4de]">Bus Factor & Knowledge Concentration Matrix</h2>
              <p className="text-xs font-mono text-[#c3c9b2]">Single-contributor dependencies & reviewer load rebalancing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-[#8d937e] hover:text-[#dfe4de] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto font-mono text-xs">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-xs font-mono text-[#b7f15b]">
              <Loader2 className="w-8 h-8 animate-spin text-[#b7f15b]" />
              <span>Analyzing contributor commit shares & bus factor indexes...</span>
            </div>
          ) : !data ? (
            <div className="text-xs font-mono text-[#8d937e]">Could not compute Bus Factor metrics.</div>
          ) : (
            <div className="space-y-6">
              {/* Bus Factor Index Hero Banner */}
              <div className="p-5 rounded-xl bg-[#181d1a] border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#8d937e]">REPOSITORY BUS FACTOR SCORE</div>
                  <div className="text-2xl font-bold text-amber-400 mt-0.5">
                    Score: {data.busFactorIndex} / 5 (High Risk)
                  </div>
                  <div className="text-[11px] text-[#c3c9b2]/80 mt-1">
                    Primary contributor <strong className="text-[#dfe4de]">{data.topContributorEmail}</strong> owns <strong className="text-[#b7f15b]">{data.topContributorSharePct}%</strong> of total commits.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold text-base text-center shrink-0">
                  {data.busFactorIndex === 1 ? '1 Person' : `${data.busFactorIndex} People`}
                </div>
              </div>

              {/* Module Ownership Concentration Table */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#dfe4de]">Module Ownership Concentration</div>
                {data.moduleOwnership.map((m, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-[#181d1a] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#dfe4de]">{m.filePath.split('/').pop()}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.risk === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>{m.ownershipPct}% Single Owner</span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${m.ownershipPct}%` }}></div>
                    </div>

                    <div className="text-[11px] text-[#8d937e]">{m.recommendation}</div>
                  </div>
                ))}
              </div>

              {/* Reviewer Workload Rebalancing Card */}
              <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#dfe4de]">
                  <span>Reviewer Workload Rebalancing</span>
                  <Activity className="w-4 h-4 text-[#b7f15b]" />
                </div>

                <div className="space-y-2">
                  {data.reviewerWorkload.map((r, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-[#1c211e]">
                      <span className="text-[#dfe4de] font-semibold">{r.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8d937e]">{r.assignedPrs} Assigned PRs</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.loadStatus === 'OVERLOADED' ? 'bg-red-500/20 text-red-300' : 'bg-[#b7f15b]/20 text-[#b7f15b]'
                        }`}>{r.loadStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-[#262b28] border border-[#b7f15b]/30 text-[11px] text-[#b7f15b]">
                  {data.rebalanceRecommendation}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusFactorDrawer;
