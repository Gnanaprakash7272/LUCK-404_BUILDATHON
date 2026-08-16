import React from 'react';
import { AtRiskStudent } from '../../types/ai';
import { RiskBadge } from '../common/RiskBadge';
import { Sparkles, ArrowUpRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface AtRiskSummaryTableProps {
  students: AtRiskStudent[];
  onSelectStudent: (student: AtRiskStudent) => void;
  onViewAllAI?: () => void;
}

export const AtRiskSummaryTable: React.FC<AtRiskSummaryTableProps> = ({
  students,
  onSelectStudent,
  onViewAllAI
}) => {
  const highRiskStudents = students.filter(s => s.risk_level === 'HIGH' || s.risk_level === 'MEDIUM');

  return (
    <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden mb-8">
      <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-sunk">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-risk-highBg text-risk-high flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">AI Academic Intelligence &mdash; At-Risk Students</h3>
            <p className="text-[11px] text-ink-faint">Students flagged by backend AI engine requiring immediate teacher intervention</p>
          </div>
        </div>
        {onViewAllAI && (
          <button
            onClick={onViewAllAI}
            className="text-[11px] font-bold uppercase tracking-wider text-accent hover:text-brand-700 transition-colors flex items-center gap-1"
          >
            <span>Full AI Insights</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-ink-soft">
          <thead className="bg-surface-sunk text-ink-faint uppercase text-[10px] font-bold tracking-wider border-b border-surface-border">
            <tr>
              <th className="py-3 px-5">Student</th>
              <th className="py-3 px-5">Risk Level & Score</th>
              <th className="py-3 px-5">Weak Subject</th>
              <th className="py-3 px-5">Attendance</th>
              <th className="py-3 px-5">Trend</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {highRiskStudents.map((st) => (
              <tr
                key={st.student_id}
                onClick={() => onSelectStudent(st)}
                className="hover:bg-surface-sunk cursor-pointer transition-colors"
              >
                <td className="py-4 px-5 font-medium text-ink">
                  {st.student_name || st.name || 'Student'}
                  <span className="block text-[11px] font-mono text-ink-faint font-normal mt-0.5">{st.roll_number || st.student_id}</span>
                </td>
                <td className="py-4 px-5">
                  <RiskBadge level={st.risk_level} score={st.risk_score} showScore size="sm" />
                </td>
                <td className="py-4 px-5 font-medium text-ink">
                  {st.weak_subject}
                  <span className="block text-[11px] text-ink-faint mt-0.5">
                    Avg: {st.evidence?.weak_subject_avg != null ? `${st.evidence.weak_subject_avg}%` : 'N/A'}
                  </span>
                </td>
                <td className="py-4 px-5">
                  <span className={`font-semibold ${(st.evidence?.attendance_pct ?? 100) < 75 ? 'text-risk-high' : 'text-ink'}`}>
                    {st.evidence?.attendance_pct != null ? `${st.evidence.attendance_pct}%` : '—'}
                  </span>
                </td>
                <td className="py-4 px-5">
                  <div className="flex items-center gap-1.5 font-medium">
                    {st.evidence?.trend?.toLowerCase() === 'declining' && <TrendingDown className="w-4 h-4 text-risk-high" />}
                    {st.evidence?.trend?.toLowerCase() === 'improving' && <TrendingUp className="w-4 h-4 text-risk-low" />}
                    {st.evidence?.trend?.toLowerCase() === 'stable' && <Minus className="w-4 h-4 text-risk-medium" />}
                    <span className={st.evidence?.trend?.toLowerCase() === 'declining' ? 'text-risk-high' : 'text-ink capitalize'}>
                      {st.evidence?.trend || 'Stable'}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-5 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStudent(st);
                    }}
                    className="px-3 py-1.5 bg-accent-light hover:bg-brand-100 text-accent text-xs font-semibold rounded-lg transition-colors"
                  >
                    View Breakdown
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
