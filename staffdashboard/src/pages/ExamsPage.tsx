import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { examService } from '../services/examService';
import { Examination } from '../types/academic';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { Award, Plus, Calendar, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ExamsPage: React.FC = () => {
  const [exams, setExams] = useState<Examination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    examService.getExams()
      .then(setExams)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><LoadingSpinner label="Loading examination directory..." /></Layout>;
  if (error) return <Layout><ErrorState message={error} /></Layout>;

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Examinations & Assessment Portal</h1>
          <p className="text-xs text-slate-500 mt-0.5">Schedule exams, track weightage, and enter official examination marks</p>
        </div>
        <button
          onClick={() => navigate('/exams/create')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Examination</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((ex) => (
          <div
            key={ex.exam_id}
            onClick={() => navigate(`/exams/${ex.exam_id}/marks`)}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                  {ex.exam_type}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  ex.status === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : ex.status === 'MARKS_PENDING'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  {ex.status === 'MARKS_PENDING' ? 'Marks Entry Pending' : ex.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{ex.title}</h3>
              <p className="text-xs text-slate-500 mb-4">{ex.course_name} &bull; {ex.class_name}</p>

              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Exam Date</span>
                  <span className="font-bold text-slate-900">{ex.exam_date}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Max Marks / Weight</span>
                  <span className="font-bold text-indigo-700">{ex.max_marks} M ({ex.weightage_pct}%)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">
                Marks Entered: {ex.marks_entered_count} / {ex.total_students}
              </span>

              <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                Enter / Update Marks <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};
