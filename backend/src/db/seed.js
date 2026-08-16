const db = require('./database');
const { createTables } = require('./schema');
const bcrypt = require('bcryptjs');

const seedDB = () => {
  try {
    console.log('Dropping existing tables if any...');
    const tables = [
      'ai_insights', 'exam_marks', 'exams', 'assignment_submissions',
      'assignments', 'attendance', 'enrollments', 'classes', 'courses',
      'teachers', 'students', 'users'
    ];
    tables.forEach(table => {
      db.exec(`DROP TABLE IF EXISTS ${table}`);
    });

    console.log('Creating schema...');
    createTables();

    console.log('Inserting seed data...');
    const hash = (password) => bcrypt.hashSync(password, 10);

    // Insert Users
    const insertUser = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    
    // Admin
    insertUser.run('Admin User', 'admin@academicpulse.com', hash('password123'), 'admin');
    
    // Teachers
    const teacher1Id = insertUser.run('Dr. Alan Turing', 'alan@academicpulse.com', hash('password123'), 'teacher').lastInsertRowid;
    const teacher2Id = insertUser.run('Dr. Ada Lovelace', 'ada@academicpulse.com', hash('password123'), 'teacher').lastInsertRowid;
    
    // Students
    const student1Id = insertUser.run('John Doe', 'john@academicpulse.com', hash('password123'), 'student').lastInsertRowid;
    const student2Id = insertUser.run('Jane Smith', 'jane@academicpulse.com', hash('password123'), 'student').lastInsertRowid;

    // Insert Student specifics
    const insertStudent = db.prepare('INSERT INTO students (user_id, roll_number) VALUES (?, ?)');
    insertStudent.run(student1Id, 'STU001');
    insertStudent.run(student2Id, 'STU002');

    // Insert Teacher specifics
    const insertTeacher = db.prepare('INSERT INTO teachers (user_id, department) VALUES (?, ?)');
    insertTeacher.run(teacher1Id, 'Computer Science');
    insertTeacher.run(teacher2Id, 'Mathematics');

    // Insert Courses
    const insertCourse = db.prepare('INSERT INTO courses (title, description, category, syllabus_text) VALUES (?, ?, ?, ?)');
    const course1Id = insertCourse.run('Introduction to AI', 'Learn the basics of Artificial Intelligence', 'CS', 'Week 1: Intro to AI. Week 2: Machine Learning...').lastInsertRowid;
    const course2Id = insertCourse.run('Advanced Mathematics', 'Calculus and Linear Algebra', 'Math', 'Week 1: Matrices. Week 2: Vectors...').lastInsertRowid;

    // Insert Classes
    const insertClass = db.prepare('INSERT INTO classes (course_id, teacher_id, schedule) VALUES (?, ?, ?)');
    const class1Id = insertClass.run(course1Id, teacher1Id, 'Mon/Wed 10:00 AM').lastInsertRowid;
    const class2Id = insertClass.run(course2Id, teacher2Id, 'Tue/Thu 02:00 PM').lastInsertRowid;

    // Insert Enrollments
    const insertEnrollment = db.prepare('INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)');
    insertEnrollment.run(student1Id, class1Id); // John in CS
    insertEnrollment.run(student1Id, class2Id); // John in Math
    insertEnrollment.run(student2Id, class1Id); // Jane in CS

    // Insert Attendance
    const insertAttendance = db.prepare('INSERT INTO attendance (class_id, student_id, date, status) VALUES (?, ?, ?, ?)');
    const dates = ['2026-08-01', '2026-08-03', '2026-08-05', '2026-08-08', '2026-08-10', '2026-08-12', '2026-08-15'];
    
    // John's Attendance (Math class2 -> ~60%, CS class1 -> ~90%)
    dates.forEach((date, i) => {
      insertAttendance.run(class1Id, student1Id, date, i % 7 === 0 ? 'absent' : 'present'); // High attendance for CS
      insertAttendance.run(class2Id, student1Id, date, i % 2 === 0 ? 'present' : 'absent'); // Low attendance for Math
      insertAttendance.run(class1Id, student2Id, date, 'present'); // Perfect attendance for Jane in CS
    });

    // Insert Assignments
    const insertAssignment = db.prepare('INSERT INTO assignments (class_id, created_by, title, description, max_score, due_date) VALUES (?, ?, ?, ?, ?, ?)');
    const csAssign1Id = insertAssignment.run(class1Id, teacher1Id, 'Intro to Neural Networks', 'Build a simple neural net', 100, '2026-08-10 23:59:00').lastInsertRowid;
    const mathAssign1Id = insertAssignment.run(class2Id, teacher2Id, 'Matrix Multiplication', 'Solve 5 problems', 50, '2026-08-14 23:59:00').lastInsertRowid;
    const mathAssign2Id = insertAssignment.run(class2Id, teacher2Id, 'Vector Spaces', 'Prove the theorem', 50, '2026-08-20 23:59:00').lastInsertRowid;

    // Insert Assignment Submissions
    const insertSubmission = db.prepare('INSERT INTO assignment_submissions (assignment_id, student_id, content_ref, score, feedback) VALUES (?, ?, ?, ?, ?)');
    // John completes CS assignment well
    insertSubmission.run(csAssign1Id, student1Id, 'github.com/johndoe/nn', 92, 'Great work! Well explained.');
    // John does poorly on Math assignment
    insertSubmission.run(mathAssign1Id, student1Id, 'drive.google.com/doc/math1', 22, 'You missed the key concepts.');
    // mathAssign2 is pending for John (no submission inserted)

    // Jane completes CS assignment
    insertSubmission.run(csAssign1Id, student2Id, 'github.com/janesmith/nn', 88, 'Good effort.');

    // Insert Exams
    const insertExam = db.prepare('INSERT INTO exams (class_id, title, max_marks, exam_date) VALUES (?, ?, ?, ?)');
    const csExamId = insertExam.run(class1Id, 'Midterm CS', 100, '2026-08-15').lastInsertRowid;
    const mathExamId = insertExam.run(class2Id, 'Midterm Math', 100, '2026-08-16').lastInsertRowid;

    // Insert Exam Marks
    const insertExamMarks = db.prepare('INSERT INTO exam_marks (exam_id, student_id, marks) VALUES (?, ?, ?)');
    // John: Good in CS, bad in Math
    insertExamMarks.run(csExamId, student1Id, 85);
    insertExamMarks.run(mathExamId, student1Id, 45);

    // Jane: Good in CS
    insertExamMarks.run(csExamId, student2Id, 95);

    console.log('Realistic academic seed data inserted successfully.');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = { seedDB };
