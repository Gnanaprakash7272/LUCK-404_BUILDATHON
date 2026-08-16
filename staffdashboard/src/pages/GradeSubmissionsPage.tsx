import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { assignmentService } from '../services/assignmentService';
import { AssignmentSubmission } from '../types/academic';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { Modal } from '../components/common/Modal';
import { ArrowLeft, CheckCircle2, FileText, Download, Award, MessageSquare, Save } from 'lucide-react';

export const GradeSubmissionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [selectedSub, setSelectedSub] = useState<AssignmentSubmission | null>(null);

  const [marksInput, setMarksInput] = useState<number>(0);
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadSubmissions = () => {
    setLoading(true);
    assignmentService.getSubmissions(id || '')
      .then(setSubmissions)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSubmissions();
  }, [id]);

  const handleOpenGradeModal = (sub: AssignmentSubmission) => {
    setSelectedSub(sub);
    setMarksInput(sub.marks_obtained || 0);
    setFeedbackInput(sub.feedback || '');
    setIsModalOpen(true);
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !id) return;

    setSaving(true);
    try {
      await assignmentService.gradeSubmission(id, {
        student_id: selectedSub.student_id,
        score: Number(marksInput),
        feedback: feedbackInput,
      });

      setIsModalOpen(false);
      loadSubmissions();
    } catch (err: any) {
      alert(err.message || 'Failed to submit grade.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner label="Loading student submissions..." /></Layout>;
  if (error) return <Layout><ErrorState message={error} /></Layout>;

  return (
    <Layout>
      <button
        onClick={() => navigate('/assignments')}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Assignments
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Student Submissions & Evaluation</h1>
          <p className="text-xs text-slate-500 mt-0.5">Enter marks and constructive academic feedback for student submissions</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Submitted Work Register</h2>
          <span className="text-xs text-slate-500 font-medium">Total: {submissions.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Submitted At</th>
                <th className="py-3 px-4">Attachment</th>
                <th className="py-3 px-4">Marks Obtained</th>
                <th className="py-3 px-4">Evaluation Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map((sub) => (
                <tr key={sub.submission_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{sub.student_name}</td>
                  <td className="py-3.5 px-4 text-slate-500">{sub.submitted_at}</td>
                  <td className="py-3.5 px-4">
                    {sub.file_attachment ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        <FileText className="w-3 h-3" /> {sub.file_attachment}
                      </span>
                    ) : (
                      <span className="text-slate-400">Text only</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold">
                    {sub.marks_obtained !== undefined ? (
                      <span className="text-indigo-700">{sub.marks_obtained} / {sub.max_marks}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${
                      sub.status === 'GRADED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenGradeModal(sub)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md transition-colors"
                    >
                      {sub.status === 'GRADED' ? 'Edit Grade' : 'Enter Grade'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade & Feedback Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Evaluate Submission — ${selectedSub?.student_name}`}
        subtitle={`Enter marks obtained out of ${selectedSub?.max_marks} and faculty feedback`}
      >
        <form onSubmit={handleSaveGrade} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Marks Obtained (Max: {selectedSub?.max_marks})
            </label>
            <input
              type="number"
              min="0"
              max={selectedSub?.max_marks || 100}
              required
              value={marksInput}
              onChange={(e) => setMarksInput(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold text-base focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Teacher Feedback & Comments
            </label>
            <textarea
              rows={4}
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              placeholder="Highlight strengths, specific errors, or recommendations for improvement..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'POST /api/assignments/:id/grade'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
