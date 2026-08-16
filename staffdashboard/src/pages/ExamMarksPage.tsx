import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { examService } from '../services/examService';
import { ExamMarkEntry, PostExamMarksPayload } from '../types/academic';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { ArrowLeft, Save, CheckCircle2, Award, AlertCircle } from 'lucide-react';

export const ExamMarksPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [markEntries, setMarkEntries] = useState<ExamMarkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    examService.getExamMarks(id || '')
      .then(setMarkEntries)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleMarkChange = (studentId: string, value: string) => {
    setMarkEntries(prev => prev.map(entry => {
      if (entry.student_id === studentId) {
        return {
          ...entry,
          marks_obtained: value === '' ? null : Math.min(entry.max_marks, Math.max(0, Number(value))),
          is_absent: false
        };
      }
      return entry;
    }));
  };

  const handleAbsentToggle = (studentId: string, isAbsent: boolean) => {
    setMarkEntries(prev => prev.map(entry => {
      if (entry.student_id === studentId) {
        return {
          ...entry,
          is_absent: isAbsent,
          marks_obtained: isAbsent ? 0 : entry.marks_obtained
        };
      }
      return entry;
    }));
  };

  const handleSubmitMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setError(null);

    const payload: PostExamMarksPayload = {
      marks_records: markEntries.map(entry => ({
        student_id: entry.student_id,
        marks: entry.is_absent ? 0 : (entry.marks_obtained || 0),
        is_absent: entry.is_absent,
        remarks: entry.remarks
      }))
    };

    try {
      await examService.postExamMarks(id || '', payload);
      setSuccessMsg("Exam marks successfully saved & updated in backend database.");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit examination marks.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner label="Loading exam marks entry grid..." /></Layout>;
  if (error) return <Layout><ErrorState message={error} /></Layout>;

  return (
    <Layout>
      <button
        onClick={() => navigate('/exams')}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Examinations
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Enter / Update Examination Marks</h1>
          <p className="text-xs text-slate-500 mt-0.5">Input individual student scores and log absent status</p>
        </div>
      </div>

      <form onSubmit={handleSubmitMarks} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900">Official Exam Mark Register</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Total Students: {markEntries.length}</span>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4 text-center">Absent Flag</th>
                <th className="py-3 px-4">Marks Obtained</th>
                <th className="py-3 px-4">Max Marks</th>
                <th className="py-3 px-4">Percentage Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {markEntries.map((entry) => {
                const scorePct = entry.marks_obtained !== null && !entry.is_absent
                  ? Math.round((entry.marks_obtained / entry.max_marks) * 100)
                  : null;

                return (
                  <tr key={entry.student_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{entry.roll_number}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{entry.student_name}</td>
                    <td className="py-3.5 px-4 text-center">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={entry.is_absent}
                          onChange={(e) => handleAbsentToggle(entry.student_id, e.target.checked)}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                        <span className={entry.is_absent ? 'font-bold text-red-700' : ''}>
                          {entry.is_absent ? 'Absent' : 'Present'}
                        </span>
                      </label>
                    </td>
                    <td className="py-3.5 px-4">
                      <input
                        type="number"
                        min="0"
                        max={entry.max_marks}
                        disabled={entry.is_absent}
                        value={entry.is_absent ? '' : (entry.marks_obtained !== null ? entry.marks_obtained : '')}
                        onChange={(e) => handleMarkChange(entry.student_id, e.target.value)}
                        placeholder="Marks"
                        className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-500">{entry.max_marks}</td>
                    <td className="py-3.5 px-4 font-bold">
                      {entry.is_absent ? (
                        <span className="text-red-600">0% (ABS)</span>
                      ) : scorePct !== null ? (
                        <span className={scorePct < 60 ? 'text-red-600' : 'text-emerald-700'}>
                          {scorePct}%
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Submitting Marks...' : 'POST /api/exams/:id/marks'}</span>
          </button>
        </div>
      </form>
    </Layout>
  );
};
