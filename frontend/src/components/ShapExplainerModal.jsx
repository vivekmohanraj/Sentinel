import React, { useState, useEffect } from 'react';
import { X, Cpu, ArrowRight, TrendingUp, TrendingDown, Info, Loader2, ShieldAlert } from 'lucide-react';
import { fetchAstExplanationApi } from '../lib/api';

const ShapExplainerModal = ({ isOpen, onClose, filePath = 'src/sentinel/core-engine/mainEngine.js', riskScore = 84 }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && filePath) {
      setIsLoading(true);
      fetchAstExplanationApi(filePath, riskScore)
        .then((res) => {
          setData(res);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load AST factor explanation:', err);
          setIsLoading(false);
        });
    }
  }, [isOpen, filePath, riskScore]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl rounded-2xl bg-[#1c211e] border border-white/10 shadow-2xl overflow-hidden space-y-0">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#181d1a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#b7f15b]/10 text-[#b7f15b] border border-[#b7f15b]/30">
              <Cpu className="w-6 h-6 text-[#b7f15b]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#dfe4de]">AST Cyclomatic Factor Explainer</h2>
              <p className="text-xs font-mono text-[#c3c9b2]">Static AST feature attribution & calculated risk factor breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-[#8d937e] hover:text-[#dfe4de] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-xs font-mono text-[#b7f15b]">
              <Loader2 className="w-8 h-8 animate-spin text-[#b7f15b]" />
              <span>Analyzing static AST cyclomatic complexity factors...</span>
            </div>
          ) : !data ? (
            <div className="text-xs font-mono text-[#8d937e]">Could not compute AST factor breakdown.</div>
          ) : (
            <div className="space-y-6">
              {/* Decision Probability Header */}
              <div className="p-5 rounded-xl bg-[#181d1a] border border-[#b7f15b]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-[#8d937e]">TARGET MODULE</div>
                  <div className="text-base font-bold font-mono text-[#dfe4de]">{data.fileName}</div>
                  <div className="text-xs font-mono text-[#c3c9b2]/70 mt-1">{data.summary}</div>
                </div>

                <div className="flex items-center gap-4 font-mono text-xs shrink-0">
                  <div className="text-center p-3 rounded-lg bg-[#1c211e] border border-white/5">
                    <div className="text-[10px] text-[#8d937e]">BASE PROB</div>
                    <div className="text-sm font-bold text-[#c3c9b2]">{data.baseValue}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#b7f15b]" />
                  <div className="text-center p-3 rounded-lg bg-[#1c211e] border border-red-500/30">
                    <div className="text-[10px] text-red-400">OUTPUT RISK</div>
                    <div className="text-base font-bold text-red-400">{data.outputValue} ({data.riskScore}%)</div>
                  </div>
                </div>
              </div>

              {/* Feature Impact Bars */}
              <div className="p-5 rounded-xl bg-[#181d1a] border border-white/5 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-bold text-[#dfe4de]">AST Metric Contribution Factors</span>
                  <span className="text-[11px] text-[#8d937e]">{data.modelName}</span>
                </div>

                <div className="space-y-3">
                  {data.features.map((f, i) => {
                    const isPos = f.direction === 'positive';
                    return (
                      <div key={i} className="space-y-1.5 p-3 rounded-lg bg-[#1c211e] border border-white/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isPos ? (
                              <TrendingUp className="w-4 h-4 text-[#ffb4ab]" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-[#b7f15b]" />
                            )}
                            <span className="font-semibold text-[#dfe4de]">{f.name}</span>
                            <span className="text-[11px] text-[#8d937e]">({f.value})</span>
                          </div>

                          <span className={`font-bold ${isPos ? 'text-[#ffb4ab]' : 'text-[#b7f15b]'}`}>
                            {f.delta}
                          </span>
                        </div>

                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isPos ? 'bg-[#ffb4ab]' : 'bg-[#b7f15b]'}`}
                            style={{ width: `${Math.min(100, Math.abs(parseFloat(f.delta)) * 300)}%` }}
                          ></div>
                        </div>

                        <div className="text-[11px] text-[#c3c9b2]/70">{f.description}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShapExplainerModal;
