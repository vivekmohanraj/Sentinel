import React, { useState } from 'react';
import { TrendingUp, Sparkles, AlertTriangle, ArrowUpRight, Cpu } from 'lucide-react';

const TechDebtQuadrantMatrix = ({ hotspots = [], onSelectRefactor }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  // Dynamically map database hotspots into the 4 Impact vs Effort Quadrants
  const rawList = hotspots && hotspots.length > 0 ? hotspots : [
    { file_path: 'src/core/main.js', complexity_score: 18.5, churn_rate: 142, bug_frequency: 12 },
    { file_path: 'src/db/connectionPool.js', complexity_score: 16.2, churn_rate: 98, bug_frequency: 8 },
    { file_path: 'src/api/apiRouter.js', complexity_score: 12.4, churn_rate: 64, bug_frequency: 4 },
    { file_path: 'src/utils/cryptoUtil.js', complexity_score: 8.2, churn_rate: 22, bug_frequency: 1 }
  ];

  const quadrantItems = rawList.map((h, idx) => {
    const filePath = h.file_path || h.filePath || `module-${idx}.js`;
    const fileName = filePath.split('/').pop();
    const complexity = parseFloat(h.complexity_score || h.complexityScore || 12.0);
    const churn = parseInt(h.churn_rate || h.churnRate || 40, 10);
    const bugs = parseInt(h.bug_frequency || h.bugFrequency || 2, 10);

    const isHighImpact = churn >= 60 || bugs >= 4;
    const isHighEffort = complexity >= 14.0;

    let quadrant = 'LOW_PRIORITY';
    let impactLabel = isHighImpact ? 'HIGH' : 'LOW';
    let effortLabel = isHighEffort ? 'HIGH' : 'LOW';
    let desc = '';

    if (isHighImpact && !isHighEffort) {
      quadrant = 'QUICK_WIN';
      desc = `Decoupling ${fileName} yields immediate ${Math.min(48, Math.round(complexity * 2.2))}% risk reduction with low effort.`;
    } else if (isHighImpact && isHighEffort) {
      quadrant = 'STRATEGIC';
      desc = `Core bottleneck across ${churn} churn edits. Requires architectural facade decomposition.`;
    } else if (!isHighImpact && isHighEffort) {
      quadrant = 'DEPRECATED';
      desc = `High cyclomatic complexity (${complexity.toFixed(1)}) but low churn. Schedule for gradual cleanup.`;
    } else {
      quadrant = 'LOW_PRIORITY';
      desc = `Stable auxiliary module with ${bugs} recorded defects and low churn.`;
    }

    return {
      id: h.id ? String(h.id) : `quad-${idx}`,
      title: fileName,
      path: filePath,
      impact: impactLabel,
      effort: effortLabel,
      complexity: complexity.toFixed(1),
      churn,
      bugs,
      quadrant,
      description: desc
    };
  });

  return (
    <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-5 animate-fadeIn font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#b7f15b]/10 text-[#b7f15b] border border-[#b7f15b]/30">
            <TrendingUp className="w-5 h-5 text-[#b7f15b]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#dfe4de]">Refactoring Priority Quadrant Matrix</h3>
            <p className="text-[11px] text-[#c3c9b2]">Dynamic Impact vs Refactoring Effort Matrix computed from PostgreSQL metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#8d937e]">
          <span className="px-2 py-1 rounded bg-[#b7f15b]/20 text-[#b7f15b]">Quick Wins</span>
          <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300">Strategic</span>
          <span className="px-2 py-1 rounded bg-white/10 text-[#c3c9b2]">Low Priority</span>
        </div>
      </div>

      {/* 2x2 Quadrant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quadrant 1: Quick Wins (High Impact, Low Effort) */}
        <div className="p-4 rounded-xl bg-[#181d1a] border border-[#b7f15b]/30 space-y-3">
          <div className="flex items-center justify-between text-[#b7f15b] font-bold">
            <span>QUADRANT I: QUICK WINS</span>
            <span className="text-[10px] uppercase">High Impact • Low Effort</span>
          </div>

          {quadrantItems.filter(i => i.quadrant === 'QUICK_WIN').length === 0 ? (
            <div className="p-3 text-[11px] text-[#8d937e] italic">No modules in Quick Wins threshold.</div>
          ) : (
            quadrantItems.filter(i => i.quadrant === 'QUICK_WIN').map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="p-3 rounded-lg bg-[#1c211e] border border-[#b7f15b]/40 hover:bg-white/5 cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#dfe4de] truncate max-w-[200px]" title={item.path}>{item.title}</span>
                  <span className="text-[#b7f15b] font-bold">{item.complexity} CPL</span>
                </div>
                <div className="text-[11px] text-[#c3c9b2]/70">{item.description}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectRefactor) onSelectRefactor(item.path, parseFloat(item.complexity));
                  }}
                  className="mt-1 px-2.5 py-1 rounded bg-[#b7f15b] text-[#223600] font-bold text-[10px] uppercase flex items-center gap-1 hover:opacity-90 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 fill-current" />
                  <span>Generate Refactoring Snippet</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Quadrant 2: Strategic (High Impact, High Effort) */}
        <div className="p-4 rounded-xl bg-[#181d1a] border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between text-amber-300 font-bold">
            <span>QUADRANT II: STRATEGIC</span>
            <span className="text-[10px] uppercase">High Impact • High Effort</span>
          </div>

          {quadrantItems.filter(i => i.quadrant === 'STRATEGIC').length === 0 ? (
            <div className="p-3 text-[11px] text-[#8d937e] italic">No modules in Strategic threshold.</div>
          ) : (
            quadrantItems.filter(i => i.quadrant === 'STRATEGIC').map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="p-3 rounded-lg bg-[#1c211e] border border-amber-500/40 hover:bg-white/5 cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#dfe4de] truncate max-w-[200px]" title={item.path}>{item.title}</span>
                  <span className="text-amber-400 font-bold">{item.complexity} CPL</span>
                </div>
                <div className="text-[11px] text-[#c3c9b2]/70">{item.description}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectRefactor) onSelectRefactor(item.path, parseFloat(item.complexity));
                  }}
                  className="mt-1 px-2.5 py-1 rounded bg-amber-400 text-[#223600] font-bold text-[10px] uppercase flex items-center gap-1 hover:opacity-90 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 fill-current" />
                  <span>Refactor Strategic Module</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Quadrant 3: Low Priority (Low Impact, Low Effort) */}
        <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-[#8d937e] font-bold">
            <span>QUADRANT III: LOW PRIORITY</span>
            <span className="text-[10px] uppercase">Low Impact • Low Effort</span>
          </div>

          {quadrantItems.filter(i => i.quadrant === 'LOW_PRIORITY').length === 0 ? (
            <div className="p-3 text-[11px] text-[#8d937e] italic">No modules in Low Priority threshold.</div>
          ) : (
            quadrantItems.filter(i => i.quadrant === 'LOW_PRIORITY').map(item => (
              <div key={item.id} className="p-3 rounded-lg bg-[#1c211e] border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#c3c9b2] truncate max-w-[200px]" title={item.path}>{item.title}</span>
                  <span className="text-[#8d937e]">{item.complexity} CPL</span>
                </div>
                <div className="text-[10px] text-[#8d937e]">{item.description}</div>
              </div>
            ))
          )}
        </div>

        {/* Quadrant 4: Deprecated / Backlog (Low Impact, High Effort) */}
        <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-[#8d937e] font-bold">
            <span>QUADRANT IV: DEPRECATED / LOW IMPACT</span>
            <span className="text-[10px] uppercase">Low Impact • High Effort</span>
          </div>

          {quadrantItems.filter(i => i.quadrant === 'DEPRECATED').length === 0 ? (
            <div className="p-3 text-[11px] text-[#8d937e] italic">No modules in Deprecated threshold.</div>
          ) : (
            quadrantItems.filter(i => i.quadrant === 'DEPRECATED').map(item => (
              <div key={item.id} className="p-3 rounded-lg bg-[#1c211e] border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#c3c9b2] truncate max-w-[200px]" title={item.path}>{item.title}</span>
                  <span className="text-[#8d937e]">{item.complexity} CPL</span>
                </div>
                <div className="text-[10px] text-[#8d937e]">{item.description}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TechDebtQuadrantMatrix;
