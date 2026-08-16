import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { aiService } from '../services/aiService';
import { AtRiskStudent } from '../types/ai';
import { AIRiskCard } from '../components/ai/AIRiskCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { Modal } from '../components/common/Modal';
import { Sparkles, ShieldAlert, AlertTriangle, CheckCircle2, Megaphone, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AIInsightsPage: React.FC = () => {
  const [students, setStudents] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 20. Bulk Parent Notification Modal State
  const [isBulkNotifyOpen, setIsBulkNotifyOpen] = useState(false);
  const [bulkSubject, setBulkSubject] = useState('URGENT: High Academic Risk Alert & Faculty Counseling Required');
  const [bulkBody, setBulkBody] = useState('Dear Parents,\n\nOur backend AI Student Risk System has identified an urgent academic risk pattern for your child. Please review the attached AI evidence breakdown and schedule an immediate faculty conference.');
  const [bulkSentSuccess, setBulkSentSuccess] = useState(false);

  const navigate = useNavigate();

  const loadAIInsights = () => {
    setLoading(true);
    setError(null);
    aiService.getAtRiskStudents()
      .then(setStudents)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAIInsights();
  }, []);

  const handleSendBulkNotify = (e: React.FormEvent) => {
    e.preventDefault();
    setBulkSentSuccess(true);
    setTimeout(() => {
      setBulkSentSuccess(false);
      setIsBulkNotifyOpen(false);
    }, 2500);
  };

  if (loading) return <Layout><LoadingSpinner label="Running AI student risk analytics..." /></Layout>;
  if (error) return <Layout><ErrorState onRetry={loadAIInsights} message={error} /></Layout>;

  // Tier groupings driven purely by backend `risk_level` as required by Section 6
  const highTier = students.filter(s => s.risk_level === 'HIGH');
  const mediumTier = students.filter(s => s.risk_level === 'MEDIUM');
  const lowTier = students.filter(s => s.risk_level === 'LOW');

  return (
    <Layout atRiskCount={students.length}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-risk-highBg text-risk-high flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-display font-semibold tracking-tight text-ink">AI Risk Intelligence</h1>
          </div>
          <p className="text-sm text-ink-faint mt-2">
            Backend AI Engine evidence analysis and actionable recommendations for early intervention
          </p>
        </div>

        {/* 20. Bulk Parent Notification Action */}
        {highTier.length > 0 && (
          <button
            onClick={() => setIsBulkNotifyOpen(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <Megaphone className="w-4 h-4" />
            <span>Notify HIGH Risk Parents ({highTier.length})</span>
          </button>
        )}
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-red-50/60 border border-red-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">High Risk Tier</p>
            <p className="text-2xl font-bold text-red-900 mt-0.5">{highTier.length}</p>
            <p className="text-[11px] text-red-600 font-medium">Immediate counseling required</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Monitor Tier</p>
            <p className="text-2xl font-bold text-amber-900 mt-0.5">{mediumTier.length}</p>
            <p className="text-[11px] text-amber-600 font-medium">Declining trend / pending tasks</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Stable Tier</p>
            <p className="text-2xl font-bold text-emerald-900 mt-0.5">{lowTier.length}</p>
            <p className="text-[11px] text-emerald-600 font-medium">On track & healthy metrics</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tier 1: 🔴 Immediate Attention (HIGH) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-risk-high/20">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-risk-high shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            <h2 className="text-[11px] font-bold text-risk-high uppercase tracking-wider">
              Immediate Attention Tier ({highTier.length} High Risk)
            </h2>
          </div>
        </div>

        {highTier.length === 0 ? (
          <div className="p-4 bg-risk-lowBg text-risk-low text-sm font-medium rounded-xl border border-risk-low/20">
            No high-risk students flagged at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {highTier.map((st) => (
              <AIRiskCard
                key={st.student_id}
                student={st}
                onViewProfile={(id) => navigate(`/students/${id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tier 2: 🟠 Monitor (MEDIUM / Declining Trend) */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-risk-medium/20">
          <div className="w-3 h-3 rounded-full bg-risk-medium" />
          <h2 className="text-[11px] font-bold text-risk-medium uppercase tracking-wider">
            Monitor Tier ({mediumTier.length} Medium Risk / Declining)
          </h2>
        </div>

        {mediumTier.length === 0 ? (
          <div className="p-4 bg-surface-sunk text-ink-soft text-sm font-medium rounded-xl border border-surface-border">
            No students currently in medium risk tier.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mediumTier.map((st) => (
              <AIRiskCard
                key={st.student_id}
                student={st}
                onViewProfile={(id) => navigate(`/students/${id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tier 3: 🟢 Stable */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-risk-low/20">
          <div className="w-3 h-3 rounded-full bg-risk-low" />
          <h2 className="text-[11px] font-bold text-risk-low uppercase tracking-wider">
            Stable Tier ({lowTier.length} Low Risk)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lowTier.map((st) => (
            <AIRiskCard
              key={st.student_id}
              student={st}
              onViewProfile={(id) => navigate(`/students/${id}`)}
            />
          ))}
        </div>
      </div>

      {/* 20. Bulk Parent Notification Modal */}
      <Modal
        isOpen={isBulkNotifyOpen}
        onClose={() => setIsBulkNotifyOpen(false)}
        title="Batch Bulk Notification to HIGH Risk Parents"
        subtitle={`Dispatch urgent alert notices to parents of ${highTier.length} high-risk students (${highTier.map(s=>s.name).join(', ')})`}
      >
        {bulkSentSuccess ? (
          <div className="py-6 text-center text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            Batch notification successfully dispatched to {highTier.length} parents!
          </div>
        ) : (
          <form onSubmit={handleSendBulkNotify} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Target Parents</label>
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-900 font-medium">
                Sending batch alert for: {highTier.map(s => `${s.name} (${s.weak_subject})`).join(', ')}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Notification Subject</label>
              <input
                type="text"
                required
                value={bulkSubject}
                onChange={(e) => setBulkSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Message Body</label>
              <textarea
                rows={5}
                required
                value={bulkBody}
                onChange={(e) => setBulkBody(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium leading-relaxed outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBulkNotifyOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Batch Notifications</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </Layout>
  );
};
