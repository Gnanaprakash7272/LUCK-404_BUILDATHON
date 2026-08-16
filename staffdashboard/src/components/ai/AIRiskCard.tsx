import React from 'react';
import { AtRiskStudent } from '../../types/ai';
import { RiskBadge } from '../common/RiskBadge';
import { TrendingDown, TrendingUp, Minus, AlertTriangle, Lightbulb, User, ArrowRight } from 'lucide-react';

interface AIRiskCardProps {
  student: AtRiskStudent;
  onViewProfile?: (studentId: string) => void;
}

export const AIRiskCard: React.FC<AIRiskCardProps> = ({ student, onViewProfile }) => {
  const displayName = student.student_name || student.name || 'Student';
  const displayRoll = student.roll_number || (typeof student.student_id === 'string' ? student.student_id : `STU-${student.student_id}`);
  const studentIdStr = String(student.student_id);

  const { risk_level, risk_score, weak_subject, recommendation, explanation } = student;
  const ev = student.evidence || {
    attendance_pct: 100,
    weak_subject: weak_subject || 'None',
    weak_subject_avg: 0,
    pending_assignments: student.pending_assignments || 0,
    trend: student.trend || 'Stable',
    trend_detail: undefined
  };

  const renderTrendIcon = (trend?: string) => {
    const t = trend?.toLowerCase();
    if (t === 'declining') return <TrendingDown className="w-4 h-4 text-red-600" />;
    if (t === 'improving') return <TrendingUp className="w-4 h-4 text-emerald-600" />;
    return <Minus className="w-4 h-4 text-amber-600" />;
  };

  const isHigh = risk_level === 'HIGH';
  const isMedium = risk_level === 'MEDIUM';

  const cardBorderClass = isHigh
    ? 'border-red-200 bg-red-50/15 hover:border-red-300'
    : isMedium
    ? 'border-amber-200 bg-amber-50/15 hover:border-amber-300'
    : 'border-emerald-200 bg-emerald-50/15 hover:border-emerald-300';

  return (
    <div className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between ${cardBorderClass}`}>
      <div>
        {/* 1. Student Identity & Risk Badge */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
              isHigh ? 'bg-red-100 text-red-700' : isMedium ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">{displayName}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{displayRoll}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RiskBadge level={risk_level} score={risk_score} showScore size="md" />
          </div>
        </div>

        {/* 2. Structured Evidence Grid */}
        <div className="py-4 border-b border-slate-100">
          <div className="flex items-center gap-1.5 mb-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Deterministic Academic Evidence</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            {/* Attendance */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px] font-medium">Attendance</span>
              <span className={`font-bold text-base ${ev.attendance_pct < 75 ? 'text-red-600' : 'text-slate-800'}`}>
                {ev.attendance_pct}%
              </span>
            </div>

            {/* Weak Subject Avg */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px] font-medium truncate">{weak_subject || 'Weak Subject'} Avg</span>
              <span className={`font-bold text-base ${ev.weak_subject_avg < 60 && ev.weak_subject_avg > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                {ev.weak_subject_avg > 0 ? `${ev.weak_subject_avg}%` : 'N/A'}
              </span>
            </div>

            {/* Pending Assignments */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px] font-medium">Pending Work</span>
              <span className={`font-bold text-base ${ev.pending_assignments > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                {ev.pending_assignments} {ev.pending_assignments === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            {/* Performance Trend */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Trend</span>
                <span className="font-bold text-sm text-slate-800 capitalize">{ev.trend}</span>
              </div>
              {renderTrendIcon(ev.trend)}
            </div>
          </div>

          {/* AI Explanation / Evidence reason */}
          {explanation && (
            <div className="bg-slate-50/80 p-3 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-200/70 mt-2">
              <p className="font-semibold text-slate-900 mb-0.5">Why is {displayName} flagged?</p>
              <p>{explanation}</p>
            </div>
          )}
        </div>

        {/* 3. Verbatim Action Recommendation */}
        <div className="pt-4">
          <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
            <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Action Recommendation</span>
          </div>
          <div className="bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-xl text-xs text-indigo-950 font-medium leading-relaxed">
            {recommendation}
          </div>
        </div>
      </div>

      {/* 4. Action Footer */}
      {onViewProfile && (
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={() => onViewProfile(studentIdStr)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-all inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50/50 hover:bg-indigo-50"
          >
            <span>View Student Academic Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

