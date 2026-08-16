const { spawn } = require('child_process');

async function runTests() {
  console.log('Starting server for VERIFICATION tests...');
  const serverProcess = spawn('node', ['src/app.js'], { stdio: 'pipe' });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const baseUrl = 'http://localhost:3000/api';
  let teacherA = ''; // Alan Turing
  let teacherB = ''; // Ada Lovelace
  let studentToken = '';

  try {
    // Login
    let res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alan@academicpulse.com', password: 'password123' })
    });
    teacherA = (await res.json()).token;

    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ada@academicpulse.com', password: 'password123' })
    });
    teacherB = (await res.json()).token;

    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john@academicpulse.com', password: 'password123' })
    });
    studentToken = (await res.json()).token;

    const authA = { 'Authorization': `Bearer ${teacherA}`, 'Content-Type': 'application/json' };
    const authB = { 'Authorization': `Bearer ${teacherB}`, 'Content-Type': 'application/json' };

    // 16. No JWT -> 401
    res = await fetch(`${baseUrl}/teacher/me`);
    console.log('16. No JWT ->', res.status === 401 ? 'PASS' : 'FAIL');

    // 17. Student -> Teacher API -> 403
    res = await fetch(`${baseUrl}/teacher/me`, { headers: { 'Authorization': `Bearer ${studentToken}` } });
    console.log('17. Student -> Teacher API ->', res.status === 403 ? 'PASS' : 'FAIL');

    // 18. Teacher A accessing Teacher B's class -> denied
    // Teacher B owns class 2.
    res = await fetch(`${baseUrl}/teacher/me/classes/2/students`, { headers: authA });
    console.log('18. Teacher A accessing Teacher B class ->', res.status === 403 ? 'PASS' : 'FAIL', res.status);

    // Get an assignment ID for Teacher B
    // We need to create an assignment for Teacher B first.
    res = await fetch(`${baseUrl}/assignments`, {
      method: 'POST',
      headers: authB,
      body: JSON.stringify({ class_id: 2, title: 'B Assignment', max_score: 100, due_date: '2026-12-31' })
    });
    const assignB = (await res.json()).id;

    // 19. Teacher A accessing Teacher B's assignment
    res = await fetch(`${baseUrl}/assignments/${assignB}/submissions`, { headers: authA });
    console.log('19. Teacher A accessing Teacher B assignment ->', res.status === 403 ? 'PASS' : 'FAIL', res.status);

    // Get an exam ID for Teacher B
    res = await fetch(`${baseUrl}/exams`, {
      method: 'POST',
      headers: authB,
      body: JSON.stringify({ class_id: 2, title: 'B Exam', max_marks: 100, exam_date: '2026-10-15' })
    });
    const examB = (await res.json()).id;

    // 20. Teacher A accessing Teacher B's exam
    res = await fetch(`${baseUrl}/exams/${examB}/marks`, { headers: authA });
    console.log('20. Teacher A accessing Teacher B exam ->', res.status === 403 ? 'PASS' : 'FAIL', res.status);

    // 21. Teacher accessing unrelated student's profile -> denied
    // Teacher B checking student 6 (who is only in Alan's class? Let's check Test Student or Jane Smith)
    // Actually, John Doe (4) is enrolled in Class 1 and Class 2, so he is in both!
    // Test Student (6) is not in Class 2.
    res = await fetch(`${baseUrl}/teacher/students/6/profile`, { headers: authB });
    console.log('21. Teacher accessing unrelated student ->', res.status === 403 ? 'PASS' : 'FAIL', res.status);

    // 22. Invalid marks (Negative) -> rejected
    res = await fetch(`${baseUrl}/exams/${examB}/marks`, {
      method: 'POST',
      headers: authB,
      body: JSON.stringify({ marks_records: [{ student_id: 4, marks: -50 }] })
    });
    console.log('22. Negative marks ->', res.status === 400 ? 'PASS' : `FAIL (${res.status})`);

    // Marks greater than max_marks -> rejected
    res = await fetch(`${baseUrl}/exams/${examB}/marks`, {
      method: 'POST',
      headers: authB,
      body: JSON.stringify({ marks_records: [{ student_id: 4, marks: 150 }] })
    });
    console.log('22b. Marks > max_marks ->', res.status === 400 ? 'PASS' : `FAIL (${res.status})`);

    // Valid marks -> success
    res = await fetch(`${baseUrl}/exams/${examB}/marks`, {
      method: 'POST',
      headers: authB,
      body: JSON.stringify({ marks_records: [{ student_id: 4, marks: 85 }] })
    });
    console.log('22c. Valid marks ->', res.status === 200 ? 'PASS' : `FAIL (${res.status})`);

    // 23. Student outside the class cannot be graded
    // Student 6 didn't submit assignment B, trying to grade:
    res = await fetch(`${baseUrl}/assignments/${assignB}/grade`, {
      method: 'POST',
      headers: authB,
      body: JSON.stringify({ student_id: 6, score: 90, feedback: '?' })
    });
    console.log('23. Student outside class grading ->', res.status === 404 ? 'PASS' : 'FAIL', res.status);

    // 24. Teacher cannot modify another teacher's attendance
    res = await fetch(`${baseUrl}/attendance`, {
      method: 'POST',
      headers: authA,
      body: JSON.stringify({ class_id: 2, date: '2026-08-16', records: [{ student_id: 4, status: 'present' }] })
    });
    console.log('24. Teacher A modifying Teacher B attendance ->', res.status === 403 ? 'PASS' : 'FAIL', res.status);

  } catch (err) {
    console.error('❌ TEST ERRORED:', err.message);
  } finally {
    console.log('Shutting down server...');
    serverProcess.kill();
  }
}

runTests();
