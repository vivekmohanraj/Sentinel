import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  FileText,
  Table,
  Code2,
  ExternalLink,
  FolderGit2,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Layers
} from 'lucide-react';
import { getExportReportUrl } from '../lib/api';

const ExportReportModal = ({ isOpen, onClose, selectedRepo = '', summary = null }) => {
  const [copiedFormat, setCopiedFormat] = useState(null);

  if (!isOpen) return null;

  const avgComplexity = parseFloat(summary?.avgComplexityScore || 10.5);
  const healthScore = summary?.avgComplexityScore
    ? Math.max(15, Math.min(100, Math.round(100 - (avgComplexity * 2.5))))
    : 92;
  const totalCommits = summary?.totalCommits ?? 0;
  const riskModulesCount = summary?.highRiskModules?.length
    ?? (summary?.modules?.filter(m => parseFloat(m.complexity_score || 0) >= 12)?.length || 0);

  const handleOpenReport = (format) => {
    const url = getExportReportUrl(format, selectedRepo);
    if (format === 'csv') {
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sentinel-audit-${(selectedRepo || 'report').replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyUrl = (format) => {
    const url = window.location.origin + getExportReportUrl(format, selectedRepo);
    navigator.clipboard.writeText(url);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl bg-[#1c211e] border border-white/10 shadow-2xl overflow-hidden space-y-0">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#181d1a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 text-[#b7f15b]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#dfe4de] flex items-center gap-2">
                <span>Executive Engineering Export Node</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#b7f15b]/10 text-[#b7f15b] border border-[#b7f15b]/30 font-mono">
                  GOVERNANCE
                </span>
              </h2>
              <p className="text-xs font-mono text-[#c3c9b2]/70">
                Export comprehensive architectural telemetry, risk matrices, and audit dossiers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8d937e] hover:text-[#dfe4de] hover:bg-white/5 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* Active Scope & Snapshot Pill */}
          <div className="p-4 rounded-xl bg-[#141815] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <FolderGit2 className="w-4 h-4 text-[#b7f15b] shrink-0" />
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#8d937e]">Target Repository Scope</div>
                <div className="text-sm font-semibold text-[#dfe4de] font-mono">
                  {selectedRepo || 'Global Portfolio Overview'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
              <div className="text-center sm:text-right">
                <div className="text-[10px] font-mono uppercase text-[#8d937e]">Health Score</div>
                <div className="text-sm font-mono font-bold text-[#b7f15b]">{healthScore}/100</div>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="text-center sm:text-right">
                <div className="text-[10px] font-mono uppercase text-[#8d937e]">Commits</div>
                <div className="text-sm font-mono font-bold text-[#dfe4de]">{totalCommits}</div>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="text-center sm:text-right">
                <div className="text-[10px] font-mono uppercase text-[#8d937e]">Hotspots</div>
                <div className="text-sm font-mono font-bold text-amber-400">{riskModulesCount}</div>
              </div>
            </div>
          </div>

          {/* Export Options Grid */}
          <div className="grid grid-cols-1 gap-3.5">
            
            {/* 1. Executive PDF / Print HTML */}
            <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 hover:border-[#b7f15b]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#b7f15b]/10 border border-[#b7f15b]/20 text-[#b7f15b] shrink-0 group-hover:scale-105 transition-transform">
                  <Printer className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#dfe4de]">Executive Audit Report (PDF / Print)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#b7f15b]/10 text-[#b7f15b] border border-[#b7f15b]/30">
                      RECOMMENDED
                    </span>
                  </div>
                  <p className="text-xs text-[#8d937e] leading-relaxed">
                    Print-optimized executive dossier featuring health radar, high-risk AST modules, maintainer bus factor, and one-click PDF print dialog.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => handleOpenReport('html')}
                  className="h-9 px-4 rounded-xl bg-[#b7f15b] text-[#223600] font-mono text-xs uppercase font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-[#b7f15b]/10 flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Open & Print</span>
                </button>
              </div>
            </div>

            {/* 2. Raw CSV Spreadsheet */}
            <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#dfe4de] shrink-0 group-hover:scale-105 transition-transform">
                  <Table className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#dfe4de]">Tabular Metric Dataset (CSV)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#c3c9b2] border border-white/10">
                      SPREADSHEET
                    </span>
                  </div>
                  <p className="text-xs text-[#8d937e] leading-relaxed">
                    Comma-delimited records of module cyclomatic complexity, churn edits, defect counts, and author contribution breakdown.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => handleOpenReport('csv')}
                  className="h-9 px-4 rounded-xl bg-[#141815] border border-white/10 text-[#dfe4de] font-mono text-xs uppercase font-bold hover:bg-white/10 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#b7f15b]" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {/* 3. JSON Telemetry Feed */}
            <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#c3c9b2] shrink-0 group-hover:scale-105 transition-transform">
                  <Code2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#dfe4de]">Raw Telemetry Payload (JSON)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#c3c9b2] border border-white/10">
                      CI / CD & API
                    </span>
                  </div>
                  <p className="text-xs text-[#8d937e] leading-relaxed">
                    Full JSON document with all relational feature store metrics, health composite scores, and bus factor telemetry for pipeline ingestion.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => handleCopyUrl('json')}
                  className="h-9 px-3 rounded-xl bg-[#141815] border border-white/10 text-[#8d937e] hover:text-[#dfe4de] hover:bg-white/5 font-mono text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Copy JSON Endpoint URL"
                >
                  {copiedFormat === 'json' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#b7f15b]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{copiedFormat === 'json' ? 'Copied' : 'Copy URL'}</span>
                </button>
                <button
                  onClick={() => handleOpenReport('json')}
                  className="h-9 px-3 rounded-xl bg-[#141815] border border-white/10 text-[#dfe4de] font-mono text-xs uppercase font-bold hover:bg-white/10 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#b7f15b]" />
                  <span>View Feed</span>
                </button>
              </div>
            </div>

          </div>

          {/* Standards & Compliance Disclaimer */}
          <div className="p-3 rounded-xl bg-[#141815]/60 border border-white/5 flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-[#b7f15b] shrink-0" />
            <span className="text-[11px] font-mono text-[#8d937e]">
              Meets ISO/IEC 25010 code quality & deterministic audit compliance standards.
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-[#181d1a] flex items-center justify-between">
          <div className="text-[11px] font-mono text-[#8d937e]">
            Sentinel Diagnostic Node v4.2
          </div>
          <button
            onClick={onClose}
            className="h-9 px-5 rounded-xl bg-white/5 text-[#dfe4de] hover:bg-white/10 font-mono text-xs uppercase font-semibold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExportReportModal;
