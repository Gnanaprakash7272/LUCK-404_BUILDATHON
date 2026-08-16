import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { assignmentService } from '../services/assignmentService';
import { Assignment } from '../types/academic';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { FileCheck2, Plus, Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'EVALUATED'>('ALL');

  const navigate = useNavigate();

  useEffect(() => {
    assignmentService.getAssignments()
      .then(setAssignments)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><LoadingSpinner label="Loading assignment portal..." /></Layout>;
  if (error) return <Layout><ErrorState message={error} /></Layout>;

  const filtered = activeTab === 'ALL'
    ? assignments
    : assignments.filter(a => a.status === activeTab);

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Assignments & Evaluation Portal</h1>
          <p className="text-xs text-slate-500 mt-0.5">Create course assignments, manage student submissions, and enter feedback</p>
        </div>
        <button
          onClick={() => navigate('/assignments/create')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Assignment</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
        {(['ALL', 'ACTIVE', 'EVALUATED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab === 'ALL' ? 'All Assignments' : tab === 'ACTIVE' ? 'Active / In Progress' : 'Fully Evaluated'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((asg) => (
          <div
            key={asg.assignment_id}
            onClick={() => navigate(`/assignments/${asg.assignment_id}/submissions`)}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
                  {asg.class_name}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  asg.status === 'EVALUATED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {asg.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{asg.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{asg.description}</p>

              <div className="space-y-2 text-xs text-slate-600 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Due Date: <strong className="text-slate-800">{asg.due_date}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-slate-400" />
                  <span>Total Points: <strong className="text-slate-800">{asg.total_points} Marks</strong></span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                <span className="text-slate-600">Submissions Progress</span>
                <span className="text-indigo-600">
                  {asg.submissions_count} / {asg.total_students}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(asg.submissions_count / (asg.total_students || 1)) * 100}%` }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-indigo-600 pt-1">
                <span>View Submissions & Grade</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};
