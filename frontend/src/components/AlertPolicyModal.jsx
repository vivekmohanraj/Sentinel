import React, { useState, useEffect } from 'react';
import { X, Bell, Save, Check, Loader2, ShieldCheck, Sliders } from 'lucide-react';
import { fetchAlertPoliciesApi, updateAlertPolicyApi } from '../lib/api';

const AlertPolicyModal = ({ isOpen, onClose }) => {
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchAlertPoliciesApi()
        .then((res) => {
          setPolicies(res);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load alert policies:', err);
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (id) => {
    setPolicies(policies.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const handleThresholdChange = (id, val) => {
    setPolicies(policies.map(p => p.id === id ? { ...p, thresholdValue: val } : p));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateAlertPolicyApi(policies);
      setSaveMessage('Alert policy thresholds updated successfully in PostgreSQL.');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save policies:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl bg-[#1c211e] border border-white/10 shadow-2xl overflow-hidden space-y-0">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#181d1a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#b7f15b]/10 text-[#b7f15b] border border-[#b7f15b]/30">
              <Sliders className="w-6 h-6 text-[#b7f15b]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#dfe4de]">Automated Alert & Policy Manager</h2>
              <p className="text-xs font-mono text-[#c3c9b2]">Configure automated threshold triggers & risk notification rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-[#8d937e] hover:text-[#dfe4de] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto font-mono text-xs">
          {isLoading ? (
            <div className="p-8 flex items-center justify-center gap-2 text-[#b7f15b]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading alert policies...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {saveMessage && (
                <div className="p-3.5 rounded-xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 text-[#b7f15b] flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{saveMessage}</span>
                </div>
              )}

              <div className="space-y-3">
                {policies.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-[#dfe4de] text-sm">{p.name}</div>
                      <button
                        type="button"
                        onClick={() => handleToggle(p.id)}
                        className={`w-11 h-6 rounded-full p-1 transition-colors ${p.enabled ? 'bg-[#b7f15b]' : 'bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-[#1c211e] transition-transform ${p.enabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </button>
                    </div>

                    <div className="text-[11px] text-[#8d937e]">{p.description}</div>

                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[10px] text-[#c3c9b2] uppercase">Trigger Threshold:</span>
                      <input
                        type="text"
                        value={p.thresholdValue}
                        onChange={(e) => handleThresholdChange(p.id, e.target.value)}
                        className="h-8 px-3 rounded-lg bg-[#1c211e] border border-white/10 text-xs text-[#b7f15b] font-bold focus:outline-none focus:border-[#b7f15b]"
                      />
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-300'
                      }`}>{p.severity} Severity</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-10 px-6 rounded-xl bg-[#b7f15b] text-[#223600] uppercase font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-[#b7f15b]/20"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isSaving ? 'Saving Policies...' : 'Save Alert Policies'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AlertPolicyModal;
