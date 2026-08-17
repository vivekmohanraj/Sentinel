import React, { useState, useEffect } from 'react';
import { X, Sparkles, Code2, ArrowRight, Check, Copy, TrendingDown, Loader2 } from 'lucide-react';
import { generateRefactoringSnippetApi } from '../lib/api';

const RefactorModal = ({ isOpen, onClose, filePath = 'src/sentinel/core-engine/mainEngine.js', complexityScore = 18.5 }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && filePath) {
      setIsLoading(true);
      generateRefactoringSnippetApi(filePath, complexityScore)
        .then((res) => {
          setData(res);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Failed to generate refactoring snippet:', err);
          setIsLoading(false);
        });
    }
  }, [isOpen, filePath, complexityScore]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (data?.codeAfter) {
      navigator.clipboard.writeText(data.codeAfter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl rounded-2xl bg-[#1c211e] border border-white/10 shadow-2xl overflow-hidden space-y-0">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#181d1a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#b7f15b]/10 text-[#b7f15b] border border-[#b7f15b]/30">
              <Sparkles className="w-6 h-6 text-[#b7f15b]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#dfe4de]">AI Refactoring Advisory & Snippet Generator</h2>
              <p className="text-xs font-mono text-[#c3c9b2]">Automated architectural pattern synthesis for high-complexity codebases</p>
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
              <span>Generating optimal refactoring code transformation...</span>
            </div>
          ) : !data ? (
            <div className="text-xs font-mono text-[#8d937e]">Could not generate refactoring advisory.</div>
          ) : (
            <div className="space-y-6">
              {/* Refactoring Metric Header Card */}
              <div className="p-5 rounded-xl bg-[#181d1a] border border-[#b7f15b]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-[#8d937e]">APPLIED DESIGN PATTERN</div>
                  <div className="text-base font-bold text-[#dfe4de]">{data.designPattern}</div>
                  <div className="text-xs font-mono text-[#c3c9b2]/80 leading-relaxed">{data.advisorySummary}</div>
                </div>

                <div className="flex items-center gap-4 font-mono text-xs shrink-0">
                  <div className="text-center p-3 rounded-lg bg-[#1c211e] border border-white/5">
                    <div className="text-[10px] text-[#8d937e]">ORIGINAL</div>
                    <div className="text-base font-bold text-[#ffb4ab]">{data.currentComplexity}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#b7f15b]" />
                  <div className="text-center p-3 rounded-lg bg-[#1c211e] border border-[#b7f15b]/30">
                    <div className="text-[10px] text-[#b7f15b]">TARGET</div>
                    <div className="text-base font-bold text-[#b7f15b]">{data.targetComplexity}</div>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-[#b7f15b]/10 border border-[#b7f15b]/30 text-[#b7f15b] font-bold text-xs flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    <span>-{data.riskReductionPercent}% Risk</span>
                  </div>
                </div>
              </div>

              {/* Code Snippets Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                {/* BEFORE CODE */}
                <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-2">
                  <div className="text-xs font-bold text-[#ffb4ab] flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    <span>High-Complexity Source Code</span>
                  </div>
                  <pre className="p-3 rounded-lg bg-[#141816] text-[#c3c9b2] text-[11px] overflow-x-auto border border-white/5 leading-relaxed font-mono">
                    {data.codeBefore}
                  </pre>
                </div>

                {/* AFTER CODE */}
                <div className="p-4 rounded-xl bg-[#181d1a] border border-[#b7f15b]/30 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-[#b7f15b] flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Refactored Clean Code</span>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="px-2.5 py-1 rounded bg-[#b7f15b]/20 hover:bg-[#b7f15b]/30 text-[#b7f15b] text-[10px] font-bold flex items-center gap-1 transition-all"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-[#141816] text-[#92d957] text-[11px] overflow-x-auto border border-[#b7f15b]/20 leading-relaxed font-mono">
                    {data.codeAfter}
                  </pre>
                </div>
              </div>

              {/* Action Recommendations */}
              <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-2 font-mono text-xs">
                <div className="font-semibold text-[#dfe4de]">Refactoring Execution Roadmap:</div>
                <ul className="space-y-1 text-[#c3c9b2]">
                  {data.recommendedActions.map((act, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#b7f15b] font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RefactorModal;
