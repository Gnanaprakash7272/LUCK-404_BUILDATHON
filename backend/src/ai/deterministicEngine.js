const db = require('../db/database');

const generateStudentEvidence = (studentId) => {
  // 1. Fetch courses the student is enrolled in
  const classes = db.prepare(`
    SELECT c.id as class_id, co.id as course_id, co.title as course_title
    FROM enrollments e
    JOIN classes c ON e.class_id = c.id
    JOIN courses co ON c.course_id = co.id
    WHERE e.student_id = ?
  `).all(studentId);

  if (classes.length === 0) {
    return createEmptyEvidence();
  }

  // 2. Fetch Attendance
  const attendanceRecords = db.prepare(`
    SELECT class_id, status 
    FROM attendance 
    WHERE student_id = ?
  `).all(studentId);

  let totalAttendance = 0;
  let presentAttendance = 0;
  const attendanceByClass = {};
  
  classes.forEach(c => attendanceByClass[c.class_id] = { total: 0, present: 0 });

  attendanceRecords.forEach(r => {
    totalAttendance++;
    if (r.status === 'present') presentAttendance++;
    if (attendanceByClass[r.class_id]) {
      attendanceByClass[r.class_id].total++;
      if (r.status === 'present') attendanceByClass[r.class_id].present++;
    }
  });

  const overallAttendancePct = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 100;

  // 3. Fetch Pending Assignments
  const pendingAssignments = db.prepare(`
    SELECT a.id, a.class_id
    FROM assignments a
    JOIN enrollments e ON a.class_id = e.class_id
    LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = e.student_id
    WHERE e.student_id = ? AND sub.id IS NULL
  `).all(studentId);

  const pendingAssignmentsCount = pendingAssignments.length;

  // 4. Fetch Scores (Assignments + Exams) for Trend and Weak Subject
  const assignmentScores = db.prepare(`
    SELECT a.class_id, sub.score as marks, a.max_score as max_marks, a.id as chronological_order
    FROM assignment_submissions sub
    JOIN assignments a ON sub.assignment_id = a.id
    WHERE sub.student_id = ? AND sub.score IS NOT NULL
  `).all(studentId);

  const examScores = db.prepare(`
    SELECT e.class_id, em.marks, e.max_marks, e.id + 10000 as chronological_order 
    FROM exam_marks em
    JOIN exams e ON em.exam_id = e.id
    WHERE em.student_id = ? AND em.marks IS NOT NULL
  `).all(studentId);

  const allScores = [...assignmentScores, ...examScores].map(s => ({
    ...s,
    percentage: (s.marks / s.max_marks) * 100
  }));

  // Calculate Course Averages
  const courseAverages = {};
  classes.forEach(c => {
    courseAverages[c.course_title] = { sum: 0, count: 0, class_id: c.class_id };
  });

  allScores.forEach(s => {
    const cInfo = classes.find(c => c.class_id === s.class_id);
    if (cInfo) {
      courseAverages[cInfo.course_title].sum += s.percentage;
      courseAverages[cInfo.course_title].count += 1;
    }
  });

  let weakSubject = 'None';
  let weakSubjectAvg = 100;

  let hasAcademicRecords = false;

  for (const [title, stats] of Object.entries(courseAverages)) {
    if (stats.count > 0) {
      hasAcademicRecords = true;
      const avg = stats.sum / stats.count;
      if (avg < weakSubjectAvg) {
        weakSubjectAvg = avg;
        weakSubject = title;
      }
    }
  }

  if (!hasAcademicRecords) {
    weakSubjectAvg = 0;
  }

  // Calculate Trend
  let trend = 'STABLE';
  if (allScores.length >= 2) {
    allScores.sort((a, b) => a.chronological_order - b.chronological_order);
    const mid = Math.floor(allScores.length / 2);
    const firstHalf = allScores.slice(0, mid);
    const secondHalf = allScores.slice(mid);

    const firstHalfAvg = firstHalf.reduce((sum, s) => sum + s.percentage, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, s) => sum + s.percentage, 0) / secondHalf.length;

    if (secondHalfAvg < firstHalfAvg - 5) {
      trend = 'DECLINING';
    } else if (secondHalfAvg > firstHalfAvg + 5) {
      trend = 'IMPROVING';
    }
  }

  // Calculate Risk Score
  let riskScore = 0;

  // Attendance risk (Max 40)
  if (overallAttendancePct < 75) {
    riskScore += Math.min(40, (75 - overallAttendancePct) * 1.5);
  }

  // Weak subject risk (Max 30)
  if (hasAcademicRecords && weakSubjectAvg < 60) {
    riskScore += Math.min(30, (60 - weakSubjectAvg));
  }

  // Pending assignments risk (Max 20, 10 per assignment)
  if (pendingAssignmentsCount > 0) {
    riskScore += Math.min(20, pendingAssignmentsCount * 10);
  }

  // Trend risk (Max 10)
  if (trend === 'DECLINING') {
    riskScore += 10;
  }

  riskScore = Math.round(Math.min(100, Math.max(0, riskScore)));

  let riskLevel = 'LOW';
  if (riskScore >= 60) {
    riskLevel = 'HIGH';
  } else if (riskScore >= 30) {
    riskLevel = 'MEDIUM';
  }

  return {
    attendance_pct: Math.round(overallAttendancePct),
    weak_subject: weakSubject,
    weak_subject_avg: Math.round(weakSubjectAvg),
    pending_assignments: pendingAssignmentsCount,
    trend: trend.toLowerCase(),
    risk_score: riskScore,
    risk_level: riskLevel
  };
};

const createEmptyEvidence = () => {
  return {
    attendance_pct: 100,
    weak_subject: 'None',
    weak_subject_avg: 100,
    pending_assignments: 0,
    trend: 'stable',
    risk_score: 0,
    risk_level: 'LOW'
  };
};

module.exports = {
  generateStudentEvidence
};
