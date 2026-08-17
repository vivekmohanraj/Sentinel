import React, { useState } from 'react';
import { X, GitPullRequest, ShieldAlert, CheckCircle2, AlertTriangle, Cpu, Loader2, Play } from 'lucide-react';
import { scanPullRequestApi } from '../lib/api';

const PrScanModal = ({ isOpen, onClose, selectedRepo = 'sentinel/core-engine' }) => {
  const [branchName, setBranchName] = useState('feature/decouple-auth-middleware');
  const [additions, setAdditions] = useState(240);
  const [deletions, setDeletions] = useState(45);
  const [targetFile, setTargetFile] = useState('src/sentinel/core-engine/mainEngine.js');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleRunScan = async (e) => {
    e.preventDefault();
    setIsScanning(true);
    setErrorMsg(null);
    try {
      const data = await scanPullRequestApi({
        repositoryId: selectedRepo,
        branchName,
        additions: parseInt(additions, 10) || 100,
        deletions: parseInt(deletions, 10) || 20,
        modifiedFiles: [targetFile]
      });
      setScanResult(data);
    } catch (err) {
      setErrorMsg('Failed to run automated PR risk scan: ' + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl rounded-2xl bg-[#1c211e] border border-white/10 shadow-2xl overflow-hidden space-y-0">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#181d1a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#b7f15b]/10 text-[#b7f15b] border border-[#b7f15b]/30">
              <GitPullRequest className="w-6 h-6 text-[#b7f15b]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#dfe4de]">PR Pre-Merge Risk Scanner</h2>
              <p className="text-xs font-mono text-[#c3c9b2]">Automated pre-merge AST risk simulation & co-change vulnerability audit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-[#8d937e] hover:text-[#dfe4de] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Simulation Input Form */}
          <form onSubmit={handleRunScan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-[11px] text-[#c3c9b2] uppercase mb-1.5">Branch Name</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#181d1a] border border-white/10 text-xs font-mono text-[#dfe4de] focus:outline-none focus:border-[#b7f15b]"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] text-[#c3c9b2] uppercase mb-1.5">Lines Added / Deleted</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={additions}
                    onChange={(e) => setAdditions(e.target.value)}
                    placeholder="+Add"
                    className="w-1/2 h-10 px-3 rounded-xl bg-[#181d1a] border border-white/10 text-xs font-mono text-[#92d957] focus:outline-none focus:border-[#b7f15b]"
                  />
                  <input
                    type="number"
                    value={deletions}
                    onChange={(e) => setDeletions(e.target.value)}
                    placeholder="-Del"
                    className="w-1/2 h-10 px-3 rounded-xl bg-[#181d1a] border border-white/10 text-xs font-mono text-[#ffb4ab] focus:outline-none focus:border-[#b7f15b]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] text-[#c3c9b2] uppercase mb-1.5">Target Module Path</label>
                <select
                  value={targetFile}
                  onChange={(e) => setTargetFile(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#181d1a] border border-white/10 text-xs font-mono text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] cursor-pointer"
                >
                  <option value="src/sentinel/core-engine/mainEngine.js">mainEngine.js (High Risk)</option>
                  <option value="src/sentinel/core-engine/connectionPool.js">connectionPool.js (Warning)</option>
                  <option value="src/sentinel/core-engine/apiRouter.js">apiRouter.js (Elevated)</option>
                  <option value="src/sentinel/core-engine/cryptoUtil.js">cryptoUtil.js (Optimized)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isScanning}
                className="h-10 px-6 rounded-xl bg-[#b7f15b] text-[#223600] font-mono text-xs uppercase font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-[#b7f15b]/20 disabled:opacity-50"
              >
                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isScanning ? 'Simulating Static Analysis...' : 'Simulate Pre-Merge Scan'}</span>
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          {/* Scan Results Display */}
          {scanResult && (
            <div className="space-y-5 pt-4 border-t border-white/10 animate-fadeIn">
              {/* Status Header Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                scanResult.mergeStatus === 'BLOCKED'
                  ? 'bg-red-500/10 border-red-500/30 text-red-300'
                  : scanResult.mergeStatus === 'NEEDS_APPROVAL'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-[#b7f15b]/10 border-[#b7f15b]/30 text-[#b7f15b]'
              }`}>
                <div className="flex items-center gap-3">
                  {scanResult.mergeStatus === 'BLOCKED' ? (
                    <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
                  ) : scanResult.mergeStatus === 'NEEDS_APPROVAL' ? (
                    <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-[#b7f15b] shrink-0" />
                  )}
                  <div>
                    <div className="text-sm font-bold font-mono uppercase tracking-wider">
                      Status: {scanResult.mergeStatus.replace('_', ' ')} (Score: {scanResult.riskScore}/100)
                    </div>
                    <div className="text-xs font-mono opacity-90 mt-0.5">{scanResult.advisoryMessage}</div>
                  </div>
                </div>

                <div className="text-right font-mono text-xs shrink-0">
                  <div className="text-lg font-bold">{scanResult.riskLevel}</div>
                  <div className="text-[10px] opacity-70">Risk Rating</div>
                </div>
              </div>

              {/* Risk Factor Contribution Grid */}
              <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#dfe4de]">
                  <Cpu className="w-4 h-4 text-[#b7f15b]" />
                  <span>Risk Factor Contribution Breakdown</span>
                </div>

                <div className="space-y-2">
                  {scanResult.shapBreakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#c3c9b2]">{item.feature}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-[#b7f15b] rounded-full"
                            style={{ width: `${Math.min(100, item.weight * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[#b7f15b] font-bold w-12 text-right">{item.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Breakdown List */}
              <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-2">
                <div className="text-xs font-mono font-semibold text-[#dfe4de]">Scanned File Risk Metrics</div>
                {scanResult.fileAnalysis.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-[#1c211e] text-xs font-mono">
                    <span className="text-[#c3c9b2]">{f.filePath}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[#8d937e]">Complexity: <strong className="text-[#dfe4de]">{f.complexityScore}</strong></span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        f.risk === 'High' ? 'bg-red-500/20 text-red-300' : 'bg-[#b7f15b]/20 text-[#b7f15b]'
                      }`}>{f.risk} Risk</span>
                    </div>
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

export default PrScanModal;
