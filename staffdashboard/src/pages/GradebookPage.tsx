import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { teacherService } from '../services/teacherService';
import { assignmentService } from '../services/assignmentService';
import { examService } from '../services/examService';
import { aiService } from '../services/aiService';
import { ClassGroup, Student, Assignment, Examination } from '../types/academic';
import { AtRiskStudent } from '../types/ai';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { Table, Download, GraduationCap, BookOpen, AlertCircle, FileSpreadsheet } from 'lucide-react';

export const GradebookPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');

  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Examination[]>([]);
  const [aiStudents, setAiStudents] = useState<AtRiskStudent[]>([]);

  // Maps: assignmentId -> studentId -> score
  const [submissionScores, setSubmissionScores] = useState<Record<string, Record<string, number | null>>>({});
  // Maps: examId -> studentId -> marks
  const [examMarksMap, setExamMarksMap] = useState<Record<string, Record<string, number | null>>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load teacher classes, assignments, exams, and AI risk profiles
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      setError(null);
      try {
        const [clsList, asgnList, examList, aiList] = await Promise.all([
          teacherService.getClasses(),
          assignmentService.getAssignments().catch(() => [] as Assignment[]),
          examService.getExams().catch(() => [] as Examination[]),
          aiService.getAtRiskStudents().catch(() => [] as AtRiskStudent[])
        ]);

        setClasses(clsList);
        setAssignments(asgnList);
        setExams(examList);
        setAiStudents(aiList);

        if (clsList.length > 0) {
          const firstId = String(clsList[0].id || clsList[0].class_id);
          setSelectedClassId(firstId);
        } else {
          setSelectedClassId('ALL');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load gradebook data.');
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // When selectedClassId changes, fetch students, submissions, and marks for that class
  useEffect(() => {
    if (loading && classes.length === 0) return;

    async function loadClassGradebook() {
      setError(null);
      try {
        let currentStudents: Student[] = [];

        if (selectedClassId === 'ALL') {
          // Fetch students for all classes
          const studentPromises = classes.map(async (cls) => {
            const cId = String(cls.id || cls.class_id);
            const stds = await teacherService.getClassStudents(cId).catch(() => [] as Student[]);
            return stds.map(s => ({
              ...s,
              student_id: String(s.id || s.student_id),
              name: s.name || s.student_name || 'Student',
              class_id: cId,
              class_name: cls.course_title || cls.name || `Class ${cId}`
            }));
          });
          const allNested = await Promise.all(studentPromises);
          const flattened = allNested.flat();
          const uniqueMap = new Map<string, Student>();
          flattened.forEach(s => {
            if (s.student_id && !uniqueMap.has(s.student_id)) {
              uniqueMap.set(s.student_id, s);
            }
          });
          currentStudents = Array.from(uniqueMap.values());
        } else {
          const matchedClass = classes.find(c => String(c.id || c.class_id) === String(selectedClassId));
          const stds = await teacherService.getClassStudents(selectedClassId).catch(() => [] as Student[]);
          currentStudents = stds.map(s => ({
            ...s,
            student_id: String(s.id || s.student_id),
            name: s.name || s.student_name || 'Student',
            class_id: selectedClassId,
            class_name: matchedClass?.course_title || matchedClass?.name || `Class ${selectedClassId}`
          }));
        }

        setStudents(currentStudents);

        // Filter assignments and exams for the selected class
        const relevantAssignments = assignments.filter(a =>
          selectedClassId === 'ALL' || String(a.class_id) === String(selectedClassId)
        );
        const relevantExams = exams.filter(e =>
          selectedClassId === 'ALL' || String(e.class_id) === String(selectedClassId)
        );

        // Fetch submissions for all relevant assignments in parallel
        const subMap: Record<string, Record<string, number | null>> = {};
        await Promise.all(
          relevantAssignments.map(async (asgn) => {
            const asgnId = String(asgn.id || asgn.assignment_id);
            try {
              const subs = await assignmentService.getSubmissions(asgnId);
              subMap[asgnId] = {};
              subs.forEach(sub => {
                const sId = String(sub.student_id);
                subMap[asgnId][sId] = sub.score !== undefined ? sub.score : sub.marks_obtained !== undefined ? sub.marks_obtained : null;
              });
            } catch {
              subMap[asgnId] = {};
            }
          })
        );
        setSubmissionScores(subMap);

        // Fetch exam marks for all relevant exams in parallel
        const markMap: Record<string, Record<string, number | null>> = {};
        await Promise.all(
          relevantExams.map(async (exm) => {
            const exmId = String(exm.id || exm.exam_id);
            try {
              const marks = await examService.getExamMarks(exmId);
              markMap[exmId] = {};
              marks.forEach(m => {
                const sId = String(m.student_id);
                markMap[exmId][sId] = m.marks_obtained !== undefined ? m.marks_obtained : (m as any).marks !== undefined ? (m as any).marks : null;
              });
            } catch {
              markMap[exmId] = {};
            }
          })
        );
        setExamMarksMap(markMap);
      } catch (err: any) {
        setError(err.message || 'Failed to update gradebook for selected class.');
      }
    }

    loadClassGradebook();
  }, [selectedClassId, classes, assignments, exams]);

  // Filtered lists for the table view
  const relevantAssignments = assignments.filter(a =>
    selectedClassId === 'ALL' || String(a.class_id) === String(selectedClassId)
  );
  const relevantExams = exams.filter(e =>
    selectedClassId === 'ALL' || String(e.class_id) === String(selectedClassId)
  );

  // Helper to compute overall academic average for a student
  const computeOverallAverage = (studentId: string) => {
    let earned = 0;
    let possible = 0;

    relevantAssignments.forEach(a => {
      const aId = String(a.id || a.assignment_id);
      const score = submissionScores[aId]?.[studentId];
      const max = a.max_score || a.total_points || 100;
      if (score !== null && score !== undefined) {
        earned += Number(score);
        possible += Number(max);
      }
    });

    relevantExams.forEach(e => {
      const eId = String(e.id || e.exam_id);
      const marks = examMarksMap[eId]?.[studentId];
      const max = e.max_marks || 100;
      if (marks !== null && marks !== undefined) {
        earned += Number(marks);
        possible += Number(max);
      }
    });

    if (possible === 0) return '—';
    const pct = Math.round((earned / possible) * 100);
    return `${pct}%`;
  };

  const getStudentAttendance = (studentId: string) => {
    const ai = aiStudents.find(a => String(a.student_id) === String(studentId));
    if (ai?.evidence?.attendance_pct !== undefined) {
      return `${ai.evidence.attendance_pct}%`;
    }
    return '—';
  };

  // CSV Export with live matrix data
  const exportGradebookCSV = () => {
    const currentClassName = selectedClassId === 'ALL'
      ? 'All_Classes'
      : (classes.find(c => String(c.id || c.class_id) === String(selectedClassId))?.course_title || `Class_${selectedClassId}`).replace(/\s+/g, '_');

    let headers = ['Roll No', 'Student Name', 'Class', 'Attendance %'];
    relevantAssignments.forEach(a => {
      const max = a.max_score || a.total_points || 100;
      headers.push(`"${a.title.replace(/"/g, '""')} (/${max})"`);
    });
    relevantExams.forEach(e => {
      const max = e.max_marks || 100;
      headers.push(`"${e.title.replace(/"/g, '""')} (/${max})"`);
    });
    headers.push('Overall Average');

    let csvContent = headers.join(',') + '\n';

    students.forEach(st => {
      const sId = String(st.id || st.student_id);
      const att = getStudentAttendance(sId);
      const row: (string | number)[] = [
        st.roll_number,
        `"${st.name.replace(/"/g, '""')}"`,
        `"${(st.class_name || '').replace(/"/g, '""')}"`,
        att
      ];

      relevantAssignments.forEach(a => {
        const aId = String(a.id || a.assignment_id);
        const score = submissionScores[aId]?.[sId];
        row.push(score !== null && score !== undefined ? score : '—');
      });

      relevantExams.forEach(e => {
        const eId = String(e.id || e.exam_id);
        const marks = examMarksMap[eId]?.[sId];
        row.push(marks !== null && marks !== undefined ? marks : '—');
      });

      row.push(computeOverallAverage(sId));
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Gradebook_${currentClassName}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner label="Loading live class gradebook from database..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Consolidated Class Gradebook</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Spreadsheet-style unified view of live student assignment & examination marks</p>
        </div>

        <button
          onClick={exportGradebookCSV}
          disabled={students.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Gradebook (CSV)</span>
        </button>
      </div>

      {/* Real Class Selector Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">Select Class:</span>
          {classes.map(cls => {
            const cId = String(cls.id || cls.class_id);
            const isSelected = selectedClassId === cId;
            return (
              <button
                key={cId}
                onClick={() => setSelectedClassId(cId)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cls.course_title || cls.name || `Class ${cId}`}
              </button>
            );
          })}
          <button
            onClick={() => setSelectedClassId('ALL')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
              selectedClassId === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Classes
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {students.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No student enrollment records found</h3>
            <p className="text-xs text-slate-500 mt-1">This class section does not have enrolled students registered in the database yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 border-r border-slate-200 sticky left-0 bg-slate-50 z-10 whitespace-nowrap">
                    Roll No & Student
                  </th>
                  <th className="py-3.5 px-4 border-r border-slate-200 text-center whitespace-nowrap">Class Section</th>
                  <th className="py-3.5 px-4 border-r border-slate-200 text-center whitespace-nowrap">Attendance Rate</th>

                  {/* Dynamic Assignment Columns */}
                  {relevantAssignments.map(asgn => {
                    const max = asgn.max_score || asgn.total_points || 100;
                    return (
                      <th
                        key={String(asgn.id || asgn.assignment_id)}
                        className="py-3.5 px-4 border-r border-slate-200 text-center bg-indigo-50/50 whitespace-nowrap"
                      >
                        <span className="block text-indigo-900 font-bold">{asgn.title}</span>
                        <span className="block text-[10px] text-indigo-600 font-normal">Max: {max} pts</span>
                      </th>
                    );
                  })}

                  {/* Dynamic Exam Columns */}
                  {relevantExams.map(exm => {
                    const max = exm.max_marks || 100;
                    return (
                      <th
                        key={String(exm.id || exm.exam_id)}
                        className="py-3.5 px-4 border-r border-slate-200 text-center bg-purple-50/50 whitespace-nowrap"
                      >
                        <span className="block text-purple-900 font-bold">{exm.title}</span>
                        <span className="block text-[10px] text-purple-600 font-normal">Max: {max} marks</span>
                      </th>
                    );
                  })}

                  <th className="py-3.5 px-4 text-center bg-slate-100 whitespace-nowrap font-extrabold text-slate-900">
                    Overall Average
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => {
                  const sId = String(st.id || st.student_id);
                  const att = getStudentAttendance(sId);
                  const overallAvg = computeOverallAverage(sId);

                  return (
                    <tr key={sId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200 sticky left-0 bg-white z-10 whitespace-nowrap">
                        <span className="font-mono text-slate-500 mr-2">{st.roll_number}</span>
                        {st.name}
                      </td>
                      <td className="py-3 px-4 border-r border-slate-200 text-center font-medium text-slate-600 whitespace-nowrap">
                        {st.class_name || '—'}
                      </td>
                      <td className="py-3 px-4 border-r border-slate-200 text-center font-bold whitespace-nowrap">
                        {att !== '—' ? (
                          <span className={parseInt(att) < 75 ? 'text-red-600' : 'text-slate-800'}>
                            {att}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </td>

                      {/* Dynamic Assignment Scores */}
                      {relevantAssignments.map(asgn => {
                        const aId = String(asgn.id || asgn.assignment_id);
                        const score = submissionScores[aId]?.[sId];
                        return (
                          <td
                            key={aId}
                            className="py-3 px-4 border-r border-slate-200 text-center font-bold text-indigo-700 bg-indigo-50/20 whitespace-nowrap"
                          >
                            {score !== null && score !== undefined ? score : <span className="text-slate-400 font-normal">—</span>}
                          </td>
                        );
                      })}

                      {/* Dynamic Exam Marks */}
                      {relevantExams.map(exm => {
                        const eId = String(exm.id || exm.exam_id);
                        const marks = examMarksMap[eId]?.[sId];
                        return (
                          <td
                            key={eId}
                            className="py-3 px-4 border-r border-slate-200 text-center font-bold text-purple-700 bg-purple-50/20 whitespace-nowrap"
                          >
                            {marks !== null && marks !== undefined ? marks : <span className="text-slate-400 font-normal">—</span>}
                          </td>
                        );
                      })}

                      <td className="py-3 px-4 text-center font-extrabold text-slate-900 bg-slate-50 whitespace-nowrap">
                        {overallAvg !== '—' ? (
                          <span className="text-slate-900">{overallAvg}</span>
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};
