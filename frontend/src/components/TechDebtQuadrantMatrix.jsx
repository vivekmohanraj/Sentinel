import React, { useState } from 'react';
import { TrendingUp, Sparkles, AlertTriangle, ArrowUpRight, Cpu } from 'lucide-react';

const TechDebtQuadrantMatrix = ({ onSelectRefactor }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  const quadrantItems = [
    { id: '1', title: 'Auth Session JWT Handler', path: 'src/sentinel/core-engine/mainEngine.js', impact: 'HIGH', effort: 'LOW', complexity: 18.5, quadrant: 'QUICK_WIN', description: 'Decoupling token verification yields immediate 38% risk reduction.' },
    { id: '2', title: 'Connection Pool Eviction', path: 'src/sentinel/core-engine/connectionPool.js', impact: 'HIGH', effort: 'HIGH', complexity: 16.2, quadrant: 'STRATEGIC', description: 'Requires major interface refactoring across pool transactions.' },
    { id: '3', title: 'Legacy Crypto Utility', path: 'src/sentinel/core-engine/cryptoUtil.js', impact: 'LOW', effort: 'LOW', complexity: 8.2, quadrant: 'LOW_PRIORITY', description: 'Stable auxiliary helper with low bug frequency.' },
    { id: '4', title: 'Planner Execution Engine', path: 'src/sentinel/core-engine/plannerEngine.js', impact: 'LOW', effort: 'HIGH', complexity: 12.4, quadrant: 'DEPRECATED', description: 'High effort refactoring with minimal sprint defect reduction.' }
  ];

  return (
    <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-5 animate-fadeIn font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#b7f15b]/10 text-[#b7f15b] border border-[#b7f15b]/30">
            <TrendingUp className="w-5 h-5 text-[#b7f15b]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#dfe4de]">Refactoring Priority Quadrant Matrix</h3>
            <p className="text-[11px] text-[#c3c9b2]">Impact vs Refactoring Effort Matrix for Architectural Backlog</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#8d937e]">
          <span className="px-2 py-1 rounded bg-[#b7f15b]/20 text-[#b7f15b]">Quick Wins</span>
          <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300">Strategic</span>
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

          {quadrantItems.filter(i => i.quadrant === 'QUICK_WIN').map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="p-3 rounded-lg bg-[#1c211e] border border-[#b7f15b]/40 hover:bg-white/5 cursor-pointer transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#dfe4de]">{item.title}</span>
                <span className="text-[#b7f15b] font-bold">{item.complexity} CPL</span>
              </div>
              <div className="text-[11px] text-[#c3c9b2]/70">{item.description}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectRefactor) onSelectRefactor(item.path, item.complexity);
                }}
                className="mt-1 px-2.5 py-1 rounded bg-[#b7f15b] text-[#223600] font-bold text-[10px] uppercase flex items-center gap-1 hover:opacity-90"
              >
                <Sparkles className="w-3 h-3 fill-current" />
                <span>Generate Refactoring Snippet</span>
              </button>
            </div>
          ))}
        </div>

        {/* Quadrant 2: Strategic (High Impact, High Effort) */}
        <div className="p-4 rounded-xl bg-[#181d1a] border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between text-amber-300 font-bold">
            <span>QUADRANT II: STRATEGIC</span>
            <span className="text-[10px] uppercase">High Impact • High Effort</span>
          </div>

          {quadrantItems.filter(i => i.quadrant === 'STRATEGIC').map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="p-3 rounded-lg bg-[#1c211e] border border-amber-500/40 hover:bg-white/5 cursor-pointer transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#dfe4de]">{item.title}</span>
                <span className="text-amber-400 font-bold">{item.complexity} CPL</span>
              </div>
              <div className="text-[11px] text-[#c3c9b2]/70">{item.description}</div>
            </div>
          ))}
        </div>

        {/* Quadrant 3: Low Priority (Low Impact, Low Effort) */}
        <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-[#8d937e] font-bold">
            <span>QUADRANT III: LOW PRIORITY</span>
            <span className="text-[10px] uppercase">Low Impact • Low Effort</span>
          </div>

          {quadrantItems.filter(i => i.quadrant === 'LOW_PRIORITY').map(item => (
            <div key={item.id} className="p-3 rounded-lg bg-[#1c211e] border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#c3c9b2]">{item.title}</span>
                <span className="text-[#8d937e]">{item.complexity} CPL</span>
              </div>
              <div className="text-[11px] text-[#8d937e]">{item.description}</div>
            </div>
          ))}
        </div>

        {/* Quadrant 4: Deprecated (Low Impact, High Effort) */}
        <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-[#8d937e] font-bold">
            <span>QUADRANT IV: DEPRECATED DEBT</span>
            <span className="text-[10px] uppercase">Low Impact • High Effort</span>
          </div>

          {quadrantItems.filter(i => i.quadrant === 'DEPRECATED').map(item => (
            <div key={item.id} className="p-3 rounded-lg bg-[#1c211e] border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#c3c9b2]">{item.title}</span>
                <span className="text-[#8d937e]">{item.complexity} CPL</span>
              </div>
              <div className="text-[11px] text-[#8d937e]">{item.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechDebtQuadrantMatrix;
