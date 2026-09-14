import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, TrendingDown, Loader2, FileCode, CheckCircle2, ShieldAlert, GitCommit, Layers } from 'lucide-react';
import { generateRefactoringSnippetApi } from '../lib/api';

const RefactorModal = ({ isOpen, onClose, filePath = '', complexityScore = 0 }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && filePath) {
      setIsLoading(true);
      generateRefactoringSnippetApi(filePath, complexityScore)
        .then((res) => {
          setData(res);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Failed to generate refactoring diagnostic:', err);
          setIsLoading(false);
        });
    }
  }, [isOpen, filePath, complexityScore]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl rounded-2xl bg-[#1c211e] border border-white/10 shadow-2xl overflow-hidden space-y-0">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#181d1a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#b7f15b]/10 text-[#b7f15b] border border-[#b7f15b]/30">
              <Sparkles className="w-6 h-6 text-[#b7f15b]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#dfe4de]">Architectural Hotspot Diagnostic & Refactoring Advisory</h2>
              <p className="text-xs font-mono text-[#c3c9b2]">Deterministic AST complexity analysis and modularization strategy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-[#8d937e] hover:text-[#dfe4de] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto font-mono text-xs">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-xs font-mono text-[#b7f15b]">
              <Loader2 className="w-8 h-8 animate-spin text-[#b7f15b]" />
              <span>Analyzing AST module metrics from PostgreSQL...</span>
            </div>
          ) : !data ? (
            <div className="text-xs font-mono text-[#8d937e] p-8 text-center">Could not generate refactoring advisory.</div>
          ) : (
            <div className="space-y-5">
              {/* File Info Header */}
              <div className="p-4 rounded-xl bg-[#181d1a] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <FileCode className="w-5 h-5 text-[#b7f15b] shrink-0" />
                  <div>
                    <span className="text-sm font-bold text-[#dfe4de]">{data.fileName}</span>
                    <div className="text-[11px] text-[#8d937e] break-all">{data.filePath}</div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#c3c9b2] text-[11px] font-bold shrink-0">
                  {data.fileCategory || 'Module'}
                </div>
              </div>

              {/* Metrics Diagnostic Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#181d1a] border border-white/5 space-y-1">
                  <div className="text-[10px] text-[#8d937e] uppercase">AST Complexity</div>
                  <div className="text-lg font-bold text-[#ffb4ab]">{data.currentComplexity} CPL</div>
                  <div className="text-[10px] text-[#ffb4ab]/80">Current Branching</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#181d1a] border border-[#b7f15b]/30 space-y-1">
                  <div className="text-[10px] text-[#b7f15b] uppercase">Target Score</div>
                  <div className="text-lg font-bold text-[#b7f15b]">{data.targetComplexity} CPL</div>
                  <div className="text-[10px] text-[#b7f15b]/80">Post-Refactoring</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#181d1a] border border-white/5 space-y-1">
                  <div className="text-[10px] text-[#8d937e] uppercase">Historical Churn</div>
                  <div className="text-lg font-bold text-[#dfe4de]">{data.churnRate} Edits</div>
                  <div className="text-[10px] text-[#8d937e]">Git Revisions</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#181d1a] border border-white/5 space-y-1">
                  <div className="text-[10px] text-[#8d937e] uppercase">Risk Reduction</div>
                  <div className="text-lg font-bold text-[#b7f15b] flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    <span>-{data.riskReductionPercent}%</span>
                  </div>
                  <div className="text-[10px] text-[#8d937e]">Predicted Impact</div>
                </div>
              </div>

              {/* Diagnostic Findings & Design Pattern */}
              <div className="p-5 rounded-xl bg-[#181d1a] border border-[#b7f15b]/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#b7f15b]">
                  <Layers className="w-4 h-4" />
                  <span>RECOMMENDED DESIGN PATTERN: {data.designPattern}</span>
                </div>
                <p className="text-xs text-[#c3c9b2] leading-relaxed">
                  {data.advisorySummary}
                </p>
              </div>

              {/* Action Recommendations Checklist */}
              <div className="p-5 rounded-xl bg-[#181d1a] border border-white/10 space-y-3">
                <div className="font-bold text-[#dfe4de] flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#b7f15b]" />
                  <span>Refactoring Execution Roadmap:</span>
                </div>
                <div className="space-y-2 text-xs text-[#c3c9b2]">
                  {data.recommendedActions?.map((act, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg bg-[#141816] border border-white/5">
                      <span className="text-[#b7f15b] font-bold shrink-0">{i + 1}.</span>
                      <span className="leading-relaxed">{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#181d1a] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#dfe4de] font-mono text-xs font-bold transition-all cursor-pointer"
          >
            Close Advisory
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefactorModal;
