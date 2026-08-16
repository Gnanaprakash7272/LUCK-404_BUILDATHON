const { spawn } = require('child_process');

async function runTests() {
  console.log('Starting server for Teacher API tests...');
  const serverProcess = spawn('node', ['src/app.js'], { stdio: 'pipe' });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const baseUrl = 'http://localhost:3000/api';
  let teacherToken = '';
  let studentToken = '';

  try {
    console.log('\n--- 1. Testing Teacher Login (Alan Turing) ---');
    let res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alan@academicpulse.com', password: 'password123' })
    });
    let data = await res.json();
    if (res.status !== 200) throw new Error('Teacher login failed');
    teacherToken = data.token;
    console.log('PASS: Logged in as Teacher');

    console.log('\n--- Getting Student Token ---');
    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john@academicpulse.com', password: 'password123' })
    });
    data = await res.json();
    studentToken = data.token;
    console.log('PASS: Logged in as Student');

    const authHeaders = { 'Authorization': `Bearer ${teacherToken}` };
    const jsonHeaders = { ...authHeaders, 'Content-Type': 'application/json' };

    console.log('\n--- 2. Testing Teacher Profile ---');
    res = await fetch(`${baseUrl}/teacher/me`, { headers: authHeaders });
    data = await res.json();
    console.log('Profile:', data.name, '-', data.department);
    if (res.status !== 200) throw new Error('Profile failed');

    console.log('\n--- 3. Testing Courses ---');
    res = await fetch(`${baseUrl}/teacher/me/courses`, { headers: authHeaders });
    data = await res.json();
    console.log('Courses count:', data.length);
    if (res.status !== 200) throw new Error('Courses failed');

    console.log('\n--- 4. Testing Classes ---');
    res = await fetch(`${baseUrl}/teacher/me/classes`, { headers: authHeaders });
    data = await res.json();
    console.log('Classes count:', data.length);
    if (res.status !== 200 || data.length === 0) throw new Error('Classes failed');
    
    const classId = data[0].id;

    console.log('\n--- 5. Testing Class Students ---');
    res = await fetch(`${baseUrl}/teacher/me/classes/${classId}/students`, { headers: authHeaders });
    data = await res.json();
    console.log('Students count:', data.length);
    if (res.status !== 200) throw new Error('Class students failed');

    console.log('\n--- 6. Testing Create Assignment ---');
    res = await fetch(`${baseUrl}/assignments`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({
        class_id: classId,
        title: 'New API Test Assignment',
        description: 'Test description',
        max_score: 100,
        due_date: '2026-12-31'
      })
    });
    data = await res.json();
    console.log('Create Assignment Response:', res.status, data);
    if (res.status !== 201) throw new Error('Create assignment failed');
    const assignmentId = data.id;

    console.log('\n--- 7. Testing Assignments List ---');
    res = await fetch(`${baseUrl}/teacher/me/assignments`, { headers: authHeaders });
    data = await res.json();
    console.log('Assignments count:', data.length);
    if (res.status !== 200) throw new Error('Assignments list failed');

    console.log('\n--- 8. Testing Grade Assignment (Requires submission first) ---');
    // First, student submits the new assignment so teacher can grade it
    const submitRes = await fetch(`${baseUrl}/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_ref: 'github.com/johndoe/test' })
    });
    console.log('Student Submit Status:', submitRes.status, await submitRes.text());
    if (submitRes.status !== 200 && submitRes.status !== 409) throw new Error('Student submission failed');
    
    // Now teacher grades it
    res = await fetch(`${baseUrl}/assignments/${assignmentId}/grade`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({
        student_id: 4, // John Doe's ID from seed
        score: 95,
        feedback: 'Excellent work!'
      })
    });
    data = await res.json();
    console.log('Grade Response:', res.status, data);
    if (res.status !== 200) throw new Error('Grade assignment failed');

    console.log('\n--- 9. Testing Attendance Record & Get ---');
    res = await fetch(`${baseUrl}/attendance`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({
        class_id: classId,
        date: '2026-08-16',
        records: [ { student_id: 4, status: 'present' } ]
      })
    });
    data = await res.json();
    console.log('Record Attendance Response:', res.status, data);
    if (res.status !== 200) throw new Error('Record attendance failed');

    res = await fetch(`${baseUrl}/attendance?class_id=${classId}&date=2026-08-16`, { headers: authHeaders });
    data = await res.json();
    console.log('Get Attendance Count:', data.length);
    if (res.status !== 200) throw new Error('Get attendance failed');

    console.log('\n--- 10. Testing Create Exam & Record Marks ---');
    res = await fetch(`${baseUrl}/exams`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({
        class_id: classId,
        title: 'Midterm 2',
        max_marks: 100,
        exam_date: '2026-10-15'
      })
    });
    data = await res.json();
    console.log('Create Exam Response:', res.status, data);
    if (res.status !== 201) throw new Error('Create exam failed');
    const examId = data.id;

    res = await fetch(`${baseUrl}/exams/${examId}/marks`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({
        marks_records: [ { student_id: 4, marks: 88 } ]
      })
    });
    data = await res.json();
    console.log('Record Marks Response:', res.status, data);
    if (res.status !== 200) throw new Error('Record marks failed');

    console.log('\n--- 11. Testing Get Exam Marks ---');
    res = await fetch(`${baseUrl}/exams/${examId}/marks`, { headers: authHeaders });
    data = await res.json();
    console.log('Exam Marks Count:', data.length);
    if (res.status !== 200) throw new Error('Get exam marks failed');

    console.log('\n--- 12. Testing Get Student Profile ---');
    res = await fetch(`${baseUrl}/teacher/students/4/profile`, { headers: authHeaders });
    data = await res.json();
    console.log('Student Profile Name:', data.name);
    if (res.status !== 200) throw new Error('Get student profile failed');

    console.log('\n--- 13. Testing At Risk Students ---');
    res = await fetch(`${baseUrl}/teacher/me/at-risk-students`, { headers: authHeaders });
    data = await res.json();
    console.log('At Risk Students Count:', data.length);
    if (res.status !== 200) throw new Error('At risk students failed');

    console.log('\n--- 14. Security: Student accessing teacher endpoint ---');
    res = await fetch(`${baseUrl}/teacher/me`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    console.log('Student -> Teacher Endpoint status:', res.status);
    if (res.status !== 403) throw new Error('Security test failed');

    console.log('\n✅ ALL TEACHER API TESTS PASSED!');
  } catch (err) {
    console.error('❌ TEST FAILED:', err.message);
  } finally {
    console.log('Shutting down server...');
    serverProcess.kill();
  }
}

runTests();
