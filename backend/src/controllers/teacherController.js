const db = require('../db/database');

const getProfile = (req, res) => {
  try {
    const profile = db.prepare(`
      SELECT u.id, u.name, u.email, t.department
      FROM users u
      JOIN teachers t ON u.id = t.user_id
      WHERE u.id = ?
    `).get(req.user.id);
    if (!profile) return res.status(404).json({ error: 'Teacher not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCourses = (req, res) => {
  try {
    const courses = db.prepare(`
      SELECT DISTINCT c.*
      FROM courses c
      JOIN classes cl ON c.id = cl.course_id
      WHERE cl.teacher_id = ?
    `).all(req.user.id);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getClasses = (req, res) => {
  try {
    const classes = db.prepare(`
      SELECT cl.id, cl.schedule, c.title as course_title, c.category,
             (SELECT COUNT(*) FROM enrollments e WHERE e.class_id = cl.id) as enrolled_count
      FROM classes cl
      JOIN courses c ON cl.course_id = c.id
      WHERE cl.teacher_id = ?
    `).all(req.user.id);
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getClassStudents = (req, res) => {
  try {
    const classId = req.params.id;
    // Verify teacher owns this class
    const cls = db.prepare('SELECT id FROM classes WHERE id = ? AND teacher_id = ?').get(classId, req.user.id);
    if (!cls) return res.status(403).json({ error: 'Forbidden. Class not found or access denied.' });

    const students = db.prepare(`
      SELECT u.id, u.name, u.email, s.roll_number
      FROM enrollments e
      JOIN students s ON e.student_id = s.user_id
      JOIN users u ON s.user_id = u.id
      WHERE e.class_id = ?
    `).all(classId);
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAssignments = (req, res) => {
  try {
    const assignments = db.prepare(`
      SELECT a.*, c.title as course_title
      FROM assignments a
      JOIN classes cl ON a.class_id = cl.id
      JOIN courses c ON cl.course_id = c.id
      WHERE cl.teacher_id = ?
    `).all(req.user.id);
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAssignmentSubmissions = (req, res) => {
  try {
    const assignmentId = req.params.id;
    // Verify teacher owns the class this assignment belongs to
    const assignment = db.prepare(`
      SELECT a.id FROM assignments a
      JOIN classes cl ON a.class_id = cl.id
      WHERE a.id = ? AND cl.teacher_id = ?
    `).get(assignmentId, req.user.id);
    if (!assignment) return res.status(403).json({ error: 'Forbidden. Assignment not found.' });

    const submissions = db.prepare(`
      SELECT sub.*, u.name as student_name, s.roll_number
      FROM assignment_submissions sub
      JOIN students s ON sub.student_id = s.user_id
      JOIN users u ON s.user_id = u.id
      WHERE sub.assignment_id = ?
    `).all(assignmentId);
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getExams = (req, res) => {
  try {
    const exams = db.prepare(`
      SELECT e.*, c.title as course_title
      FROM exams e
      JOIN classes cl ON e.class_id = cl.id
      JOIN courses c ON cl.course_id = c.id
      WHERE cl.teacher_id = ?
    `).all(req.user.id);
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getExamMarks = (req, res) => {
  try {
    const examId = req.params.id;
    const exam = db.prepare(`
      SELECT e.id FROM exams e
      JOIN classes cl ON e.class_id = cl.id
      WHERE e.id = ? AND cl.teacher_id = ?
    `).get(examId, req.user.id);
    if (!exam) return res.status(403).json({ error: 'Forbidden. Exam not found.' });

    const marks = db.prepare(`
      SELECT em.*, u.name as student_name, s.roll_number
      FROM exam_marks em
      JOIN students s ON em.student_id = s.user_id
      JOIN users u ON s.user_id = u.id
      WHERE em.exam_id = ?
    `).all(examId);
    res.json(marks);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getStudentProfile = (req, res) => {
  try {
    const studentId = req.params.studentId;
    // Check if student is enrolled in ANY of this teacher's classes
    const isEnrolled = db.prepare(`
      SELECT 1 FROM enrollments e
      JOIN classes cl ON e.class_id = cl.id
      WHERE e.student_id = ? AND cl.teacher_id = ?
      LIMIT 1
    `).get(studentId, req.user.id);

    if (!isEnrolled) return res.status(403).json({ error: 'Forbidden. Student not in your classes.' });

    const profile = db.prepare(`
      SELECT u.id, u.name, u.email, s.roll_number
      FROM users u
      JOIN students s ON u.id = s.user_id
      WHERE u.id = ?
    `).get(studentId);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const { getOrGenerateInsight } = require('../ai/aiService');

const getAtRiskStudents = async (req, res) => {
  try {
    // Get students in this teacher's classes
    const students = db.prepare(`
      SELECT DISTINCT s.user_id as student_id, u.name as student_name, s.roll_number
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN enrollments e ON s.user_id = e.student_id
      JOIN classes cl ON e.class_id = cl.id
      WHERE cl.teacher_id = ?
    `).all(req.user.id);

    const results = [];
    for (const st of students) {
      const insight = await getOrGenerateInsight(st.student_id, 'teacher');
      
      if (insight.risk_level === 'HIGH' || insight.risk_level === 'MEDIUM') {
        results.push({
          student_id: st.student_id,
          student_name: st.student_name,
          roll_number: st.roll_number,
          risk_level: insight.risk_level,
          risk_score: insight.risk_score,
          weak_subject: insight.weak_subject,
          trend: insight.trend,
          pending_assignments: insight.pending_assignments,
          evidence: insight.evidence,
          explanation: insight.explanation,
          recommendation: insight.recommendation,
          generated_at: insight.generated_at
        });
      }
    }

    // Sort by risk score descending
    results.sort((a, b) => b.risk_score - a.risk_score);

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Modifying data

const createAssignment = (req, res) => {
  try {
    const { class_id, title, description, max_score, due_date } = req.body;
    const cls = db.prepare('SELECT id FROM classes WHERE id = ? AND teacher_id = ?').get(class_id, req.user.id);
    if (!cls) return res.status(403).json({ error: 'Forbidden. Class not found.' });

    const info = db.prepare(`
      INSERT INTO assignments (class_id, created_by, title, description, max_score, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(class_id, req.user.id, title, description, max_score, due_date);
    res.status(201).json({ id: info.lastInsertRowid, message: 'Assignment created' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const gradeAssignment = (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { student_id, score, feedback } = req.body;
    
    const assignment = db.prepare(`
      SELECT a.id FROM assignments a
      JOIN classes cl ON a.class_id = cl.id
      WHERE a.id = ? AND cl.teacher_id = ?
    `).get(assignmentId, req.user.id);
    if (!assignment) return res.status(403).json({ error: 'Forbidden.' });

    // Update submission
    const info = db.prepare(`
      UPDATE assignment_submissions
      SET score = ?, feedback = ?
      WHERE assignment_id = ? AND student_id = ?
    `).run(score, feedback, assignmentId, student_id);

    if (info.changes === 0) return res.status(404).json({ error: 'Submission not found' });
    res.json({ message: 'Graded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const recordAttendance = (req, res) => {
  try {
    // Expected { class_id, date, records: [{ student_id, status }] }
    const { class_id, date, records } = req.body;
    const cls = db.prepare('SELECT id FROM classes WHERE id = ? AND teacher_id = ?').get(class_id, req.user.id);
    if (!cls) return res.status(403).json({ error: 'Forbidden.' });

    const stmt = db.prepare('INSERT OR REPLACE INTO attendance (class_id, student_id, date, status) VALUES (?, ?, ?, ?)');
    
    db.transaction(() => {
      for (const rec of records) {
        stmt.run(class_id, rec.student_id, date, rec.status);
      }
    })();
    res.json({ message: 'Attendance recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAttendance = (req, res) => {
  try {
    const { class_id, date } = req.query;
    const cls = db.prepare('SELECT id FROM classes WHERE id = ? AND teacher_id = ?').get(class_id, req.user.id);
    if (!cls) return res.status(403).json({ error: 'Forbidden.' });

    let query = 'SELECT * FROM attendance WHERE class_id = ?';
    const params = [class_id];
    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }
    const records = db.prepare(query).all(...params);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createExam = (req, res) => {
  try {
    const { class_id, title, max_marks, exam_date } = req.body;
    const cls = db.prepare('SELECT id FROM classes WHERE id = ? AND teacher_id = ?').get(class_id, req.user.id);
    if (!cls) return res.status(403).json({ error: 'Forbidden.' });

    const info = db.prepare(`
      INSERT INTO exams (class_id, title, max_marks, exam_date)
      VALUES (?, ?, ?, ?)
    `).run(class_id, title, max_marks, exam_date);
    res.status(201).json({ id: info.lastInsertRowid, message: 'Exam created' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const recordExamMarks = (req, res) => {
  try {
    const examId = req.params.id;
    // Expected { marks_records: [{ student_id, marks }] }
    const { marks_records } = req.body;
    
    const exam = db.prepare(`
      SELECT e.id, e.max_marks FROM exams e
      JOIN classes cl ON e.class_id = cl.id
      WHERE e.id = ? AND cl.teacher_id = ?
    `).get(examId, req.user.id);
    if (!exam) return res.status(403).json({ error: 'Forbidden.' });

    for (const rec of marks_records) {
      if (typeof rec.marks !== 'number' || rec.marks < 0 || rec.marks > exam.max_marks) {
        return res.status(400).json({ error: 'Invalid marks: must be a number between 0 and ' + exam.max_marks });
      }
    }

    const stmt = db.prepare('INSERT OR REPLACE INTO exam_marks (exam_id, student_id, marks) VALUES (?, ?, ?)');
    
    db.transaction(() => {
      for (const rec of marks_records) {
        stmt.run(examId, rec.student_id, rec.marks);
      }
    })();
    res.json({ message: 'Marks recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getProfile, getCourses, getClasses, getClassStudents, getAssignments,
  getAssignmentSubmissions, getExams, getExamMarks, getStudentProfile,
  getAtRiskStudents, createAssignment, gradeAssignment,
  recordAttendance, getAttendance, createExam, recordExamMarks
};
