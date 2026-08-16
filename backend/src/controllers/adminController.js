const db = require('../db/database');

const getAllStudents = (req, res) => {
  try {
    const students = db.prepare(`
      SELECT u.id, u.name, u.email, s.roll_number, u.created_at
      FROM users u
      JOIN students s ON u.id = s.user_id
    `).all();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllTeachers = (req, res) => {
  try {
    const teachers = db.prepare(`
      SELECT u.id, u.name, u.email, t.department, u.created_at
      FROM users u
      JOIN teachers t ON u.id = t.user_id
    `).all();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllCourses = (req, res) => {
  try {
    const courses = db.prepare('SELECT * FROM courses').all();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createCourse = (req, res) => {
  try {
    const { title, description, category, syllabus_text } = req.body;
    const info = db.prepare(`
      INSERT INTO courses (title, description, category, syllabus_text)
      VALUES (?, ?, ?, ?)
    `).run(title, description, category, syllabus_text);
    res.status(201).json({ id: info.lastInsertRowid, message: 'Course created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getOverviewAnalytics = (req, res) => {
  try {
    const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
    const totalTeachers = db.prepare('SELECT COUNT(*) as count FROM teachers').get().count;
    const totalCourses = db.prepare('SELECT COUNT(*) as count FROM courses').get().count;
    const totalClasses = db.prepare('SELECT COUNT(*) as count FROM classes').get().count;

    // Attendance Avg
    const attendanceStats = db.prepare(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count
      FROM attendance
    `).get();
    
    let avgAttendance = 0;
    if (attendanceStats.total_records > 0) {
      avgAttendance = (attendanceStats.present_count / attendanceStats.total_records) * 100;
    }

    // AI Insights (High Risk count)
    const atRiskStudents = db.prepare(`
      SELECT COUNT(*) as count FROM ai_insights WHERE risk_level = 'HIGH'
    `).get().count;

    res.json({
      total_students: totalStudents,
      total_teachers: totalTeachers,
      total_courses: totalCourses,
      total_classes: totalClasses,
      avg_attendance_percentage: avgAttendance,
      at_risk_students: atRiskStudents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getClassAnalytics = (req, res) => {
  try {
    const courseId = req.params.courseId;
    
    const course = db.prepare(`
      SELECT id, title
      FROM courses
      WHERE id = ?
    `).get(courseId);

    if (!course) return res.status(404).json({ error: 'Course not found' });

    const totalStudents = db.prepare(`
      SELECT COUNT(*) as count 
      FROM enrollments e
      JOIN classes cl ON e.class_id = cl.id
      WHERE cl.course_id = ?
    `).get(courseId).count;

    const attendanceStats = db.prepare(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count
      FROM attendance a
      JOIN classes cl ON a.class_id = cl.id
      WHERE cl.course_id = ?
    `).get(courseId);

    let avgAttendance = 0;
    if (attendanceStats.total_records > 0) {
      avgAttendance = (attendanceStats.present_count / attendanceStats.total_records) * 100;
    }

    const marksStats = db.prepare(`
      SELECT AVG(CAST(em.marks AS FLOAT) / ex.max_marks * 100) as avg_score
      FROM exam_marks em
      JOIN exams ex ON em.exam_id = ex.id
      JOIN classes cl ON ex.class_id = cl.id
      WHERE cl.course_id = ?
    `).get(courseId);

    res.json({
      course: course,
      total_students: totalStudents,
      avg_attendance_percentage: avgAttendance,
      avg_exam_score_percentage: marksStats.avg_score || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getComparativeAnalytics = (req, res) => {
  try {
    // Compare classes by average score and attendance
    const classesData = db.prepare(`
      SELECT cl.id as class_id, c.title as course_title,
             (SELECT COUNT(*) FROM enrollments WHERE class_id = cl.id) as enrolled,
             (SELECT AVG(CAST(em.marks AS FLOAT) / e.max_marks * 100)
              FROM exam_marks em JOIN exams e ON em.exam_id = e.id
              WHERE e.class_id = cl.id) as avg_score,
             (SELECT CAST(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100
              FROM attendance WHERE class_id = cl.id) as avg_attendance
      FROM classes cl
      JOIN courses c ON cl.course_id = c.id
    `).all();

    // Fill nulls with 0 for clean JSON output
    const cleanData = classesData.map(c => ({
      ...c,
      avg_score: c.avg_score || 0,
      avg_attendance: c.avg_attendance || 0
    }));

    res.json(cleanData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllStudents,
  getAllTeachers,
  getAllCourses,
  createCourse,
  getOverviewAnalytics,
  getClassAnalytics,
  getComparativeAnalytics
};
