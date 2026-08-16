import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { examService } from '../services/examService';
import { teacherService } from '../services/teacherService';
import { Course, ClassGroup } from '../types/academic';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ArrowLeft, Save, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CreateExamPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);

  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState<'MIDTERM' | 'FINAL' | 'UNIT_TEST' | 'QUIZ'>('MIDTERM');
  const [courseId, setCourseId] = useState('');
  const [classId, setClassId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [weightagePct, setWeightagePct] = useState(25);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([teacherService.getCourses(), teacherService.getClasses()])
      .then(([crsList, clsList]) => {
        setCourses(crsList);
        setClasses(clsList);
        if (crsList.length > 0) setCourseId(crsList[0].course_id);
        if (clsList.length > 0) setClassId(clsList[0].class_id);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await examService.createExam({
        title,
        exam_type: examType,
        course_id: courseId,
        class_id: classId,
        exam_date: examDate,
        max_marks: Number(maxMarks),
        weightage_pct: Number(weightagePct),
      });

      navigate('/exams');
    } catch (err: any) {
      setError(err.message || 'Failed to create examination.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner label="Preparing examination setup..." /></Layout>;

  return (
    <Layout>
      <button
        onClick={() => navigate('/exams')}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Examinations
      </button>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Create New Examination</h1>
            <p className="text-xs text-slate-500">Configure examination type, date, maximum marks, and course weightage</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Examination Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Examination — Advanced Calculus"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assessment Category / Type
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium"
              >
                <option value="MIDTERM">Midterm Examination</option>
                <option value="FINAL">Final Examination</option>
                <option value="UNIT_TEST">Unit Test</option>
                <option value="QUIZ">Quiz / Assessment</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Examination Date
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Course
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium"
              >
                {courses.map(c => (
                  <option key={c.course_id} value={c.course_id}>{c.course_code} — {c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Class Group
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium"
              >
                {classes.map(c => (
                  <option key={c.class_id} value={c.class_id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Maximum Total Marks
              </label>
              <input
                type="number"
                min="10"
                max="500"
                required
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Overall Course Weightage (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={weightagePct}
                onChange={(e) => setWeightagePct(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/exams')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Creating Exam...' : 'POST /api/exams'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
