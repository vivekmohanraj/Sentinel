import React, { useState } from 'react';
import { X, GitBranch, ShieldCheck, CheckCircle2, AlertTriangle, Play, Loader2, Cpu } from 'lucide-react';
import { runBranchDiagnosticsApi } from '../lib/api';

const BranchDiagnosticsModal = ({ isOpen, onClose, selectedRepo = 'sentinel/core-engine' }) => {
  const [branchName, setBranchName] = useState('feature/local-precheck');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleScan = async (e) => {
    e.preventDefault();
    setIsScanning(true);
    setErrorMsg(null);
    try {
      const data = await runBranchDiagnosticsApi({ branchName, repoName: selectedRepo });
      setResult(data);
    } catch (err) {
      setErrorMsg('Failed to run branch diagnostics: ' + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl rounded-2xl bg-[#1c211e] border border-white/10 shadow-2xl overflow-hidden space-y-0">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#181d1a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#b7f15b]/10 text-[#b7f15b] border border-[#b7f15b]/30">
              <GitBranch className="w-6 h-6 text-[#b7f15b]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#dfe4de]">Developer Branch Pre-Check Diagnostics</h2>
              <p className="text-xs font-mono text-[#c3c9b2]">Private non-punitive AST complexity & diff vulnerability check</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-[#8d937e] hover:text-[#dfe4de] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto font-mono text-xs">
          {/* Privacy Protection Banner */}
          <div className="p-4 rounded-xl bg-[#262b28] border border-[#b7f15b]/30 text-[#b7f15b] flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <div className="text-[11px] leading-relaxed">
              <strong>Non-Punitive Privacy Guarantee:</strong> Branch diagnostics are computed in your private sandbox session. Results are hidden from management metrics and never used for evaluation.
            </div>
          </div>

          <form onSubmit={handleScan} className="flex gap-3">
            <input
              type="text"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="e.g. feature/my-local-branch"
              className="flex-1 h-11 px-4 rounded-xl bg-[#181d1a] border border-white/10 text-xs text-[#dfe4de] focus:outline-none focus:border-[#b7f15b]"
              required
            />
            <button
              type="submit"
              disabled={isScanning}
              className="h-11 px-6 rounded-xl bg-[#b7f15b] text-[#223600] uppercase font-bold hover:opacity-90 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isScanning ? 'Checking AST...' : 'Run Diagnostics'}</span>
            </button>
          </form>

          {errorMsg && <div className="p-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30">{errorMsg}</div>}

          {result && (
            <div className="space-y-4 border-t border-white/10 pt-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#8d937e]">OVERALL BRANCH AST STATUS</div>
                  <div className="text-base font-bold text-[#b7f15b] mt-0.5">{result.overallStatus}</div>
                  <div className="text-[11px] text-[#c3c9b2]/80 mt-1">Cyclomatic score delta: {result.cyclomaticScoreDelta}</div>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-[#b7f15b]/10 text-[#b7f15b] font-bold text-xs border border-[#b7f15b]/30">
                  {result.modifiedFilesCount} Files Scanned
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-[#dfe4de]">Module Diff Diagnostics</div>
                {result.diffAnalysis.map((item, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#181d1a] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#dfe4de]">{item.filePath}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'WARNING' ? 'bg-amber-500/20 text-amber-300' : 'bg-[#b7f15b]/20 text-[#b7f15b]'
                      }`}>{item.complexityDelta} Complexity</span>
                    </div>
                    <div className="text-[11px] text-[#8d937e]">{item.recommendation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchDiagnosticsModal;
