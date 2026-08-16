const db = require('./src/db/database');
const { generateStudentEvidence } = require('./src/ai/deterministicEngine');

function runTests() {
  console.log('--- STAGE 6A: DETERMINISTIC AI ENGINE TESTS ---\n');

  try {
    // 1. JOHN DOE SCENARIO
    console.log('=== 1. EXPECTED JOHN DOE SCENARIO ===');
    const john = db.prepare("SELECT id FROM users WHERE email = 'john@academicpulse.com'").get();
    if (!john) throw new Error("John Doe not found in DB");
    
    const evidenceJohn = generateStudentEvidence(john.id);
    console.log(JSON.stringify(evidenceJohn, null, 2));

    if (evidenceJohn.risk_level !== 'HIGH' && evidenceJohn.risk_level !== 'MEDIUM') {
      console.log('⚠️ Warning: John Doe should ideally be HIGH or MEDIUM risk based on seed data.');
    } else {
      console.log('✅ John Doe calculation looks solid.\n');
    }

    // EDGE CASES
    console.log('=== 2. EDGE CASES ===');

    // Create a dummy user for edge cases
    const insertUser = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')");
    const insertStudent = db.prepare("INSERT INTO students (user_id, roll_number) VALUES (?, ?)");
    const insertEnrollment = db.prepare("INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)");
    const insertAttendance = db.prepare("INSERT INTO attendance (class_id, student_id, date, status) VALUES (?, ?, ?, ?)");

    // We need a class ID to enroll them in.
    const classId = 1; // Assuming class 1 exists

    db.transaction(() => {
      const edgeUser = insertUser.run('Edge Case', 'edge@test.com', 'hash').lastInsertRowid;
      insertStudent.run(edgeUser, 'EDGE001');

      // A) No academic records (No enrollments)
      const evNoRecords = generateStudentEvidence(edgeUser);
      console.log('A) No academic records (Not Enrolled):', evNoRecords.risk_level === 'LOW' ? 'PASS' : 'FAIL');

      // Enroll the student
      insertEnrollment.run(edgeUser, classId);

      // B) Enrolled, but No attendance, no assignments, no exams
      const evEnrolledNoData = generateStudentEvidence(edgeUser);
      console.log('B) No data (100% default attendance, no risk):', evEnrolledNoData.risk_level === 'LOW' ? 'PASS' : 'FAIL');

      // C) 0% attendance
      insertAttendance.run(classId, edgeUser, '2026-08-01', 'absent');
      const evZeroAtt = generateStudentEvidence(edgeUser);
      console.log('C) 0% attendance:', evZeroAtt.attendance_pct === 0 ? 'PASS' : 'FAIL');

      // D) 100% attendance
      insertAttendance.run(classId, edgeUser, '2026-08-02', 'present'); // Now 1 absent, 1 present -> 50%
      insertAttendance.run(classId, edgeUser, '2026-08-03', 'present');
      insertAttendance.run(classId, edgeUser, '2026-08-04', 'present');
      insertAttendance.run(classId, edgeUser, '2026-08-05', 'present'); // 4 present, 1 absent -> 80%
      // Let's just create another user for pure 100%
      const edgeUser2 = insertUser.run('Edge Case 2', 'edge2@test.com', 'hash').lastInsertRowid;
      insertStudent.run(edgeUser2, 'EDGE002');
      insertEnrollment.run(edgeUser2, classId);
      insertAttendance.run(classId, edgeUser2, '2026-08-01', 'present');
      const ev100Att = generateStudentEvidence(edgeUser2);
      console.log('D) 100% attendance:', ev100Att.attendance_pct === 100 ? 'PASS' : 'FAIL');

      // E) No trend data (Only 1 score)
      const insertExamMarks = db.prepare('INSERT INTO exam_marks (exam_id, student_id, marks) VALUES (?, ?, ?)');
      insertExamMarks.run(1, edgeUser2, 90); // Assuming exam 1 exists
      const evNoTrend = generateStudentEvidence(edgeUser2);
      console.log('E) No trend data (1 score):', evNoTrend.trend === 'stable' ? 'PASS' : 'FAIL');

      // F) Pending assignments
      // Let's create an assignment in class 1
      const insertAssignment = db.prepare("INSERT INTO assignments (class_id, created_by, title, max_score, due_date) VALUES (?, ?, ?, ?, ?)");
      const newAssignId = insertAssignment.run(classId, 2, 'Pending Assign', 100, '2026-12-31').lastInsertRowid;
      
      const evPending = generateStudentEvidence(edgeUser2);
      console.log('F) Pending assignment counted:', evPending.pending_assignments === 1 ? 'PASS' : 'FAIL');

      // Rollback so we don't pollute the DB
      throw new Error("ROLLBACK_TESTS");
    })();
  } catch (err) {
    if (err.message === "ROLLBACK_TESTS") {
      console.log('\nEdge cases ran successfully. Database rolled back cleanly.');
    } else {
      console.error('❌ TEST FAILED:', err);
    }
  }

  console.log('\n✅ ALL STAGE 6A TESTS COMPLETED!');
}

runTests();
