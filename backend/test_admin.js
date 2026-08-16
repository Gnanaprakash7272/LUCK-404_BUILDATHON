const { spawn } = require('child_process');

async function runTests() {
  console.log('Starting server for Admin API tests...');
  const serverProcess = spawn('node', ['src/app.js'], { stdio: 'pipe' });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const baseUrl = 'http://localhost:3000/api';
  let adminToken = '';
  let studentToken = '';

  try {
    console.log('\n--- 1. Testing Admin Login (Admin User) ---');
    let res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@academicpulse.com', password: 'password123' })
    });
    let data = await res.json();
    if (res.status !== 200) throw new Error('Admin login failed');
    adminToken = data.token;
    console.log('PASS: Logged in as Admin');

    console.log('\n--- Getting Student Token for Security Check ---');
    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john@academicpulse.com', password: 'password123' })
    });
    studentToken = (await res.json()).token;

    const authHeaders = { 'Authorization': `Bearer ${adminToken}` };
    const jsonHeaders = { ...authHeaders, 'Content-Type': 'application/json' };

    console.log('\n--- 2. Testing Get All Students ---');
    res = await fetch(`${baseUrl}/admin/students`, { headers: authHeaders });
    data = await res.json();
    console.log('Students count:', data.length);
    if (res.status !== 200 || !Array.isArray(data)) throw new Error('Get students failed');

    console.log('\n--- 3. Testing Get All Teachers ---');
    res = await fetch(`${baseUrl}/admin/teachers`, { headers: authHeaders });
    data = await res.json();
    console.log('Teachers count:', data.length);
    if (res.status !== 200 || !Array.isArray(data)) throw new Error('Get teachers failed');

    console.log('\n--- 4. Testing Get All Courses ---');
    res = await fetch(`${baseUrl}/admin/courses`, { headers: authHeaders });
    data = await res.json();
    console.log('Courses count:', data.length);
    if (res.status !== 200 || !Array.isArray(data)) throw new Error('Get courses failed');

    console.log('\n--- 5. Testing Create Course ---');
    res = await fetch(`${baseUrl}/admin/courses`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({
        title: 'Cybersecurity 101',
        description: 'Intro to cyber',
        category: 'CS',
        syllabus_text: 'Syllabus content'
      })
    });
    data = await res.json();
    console.log('Create Course Response:', res.status, data);
    if (res.status !== 201) throw new Error('Create course failed');

    console.log('\n--- 6. Testing Overview Analytics ---');
    res = await fetch(`${baseUrl}/admin/analytics/overview`, { headers: authHeaders });
    data = await res.json();
    console.log('Overview Analytics:', data);
    if (res.status !== 200) throw new Error('Overview analytics failed');

    console.log('\n--- 7. Testing Class Analytics (Course 1) ---');
    res = await fetch(`${baseUrl}/admin/analytics/class/1`, { headers: authHeaders });
    data = await res.json();
    console.log('Course 1 Analytics:', data.course.title, '- Avg Score:', data.avg_exam_score_percentage);
    if (res.status !== 200) throw new Error('Class analytics failed');

    console.log('\n--- 7b. Testing Invalid Course ID ---');
    res = await fetch(`${baseUrl}/admin/analytics/class/999`, { headers: authHeaders });
    console.log('Invalid Course response status:', res.status);
    if (res.status !== 404) throw new Error('Invalid course ID test failed');

    console.log('\n--- 8. Testing Comparative Analytics ---');
    res = await fetch(`${baseUrl}/admin/analytics/comparative`, { headers: authHeaders });
    data = await res.json();
    console.log('Comparative Analytics Count:', data.length);
    if (res.status !== 200 || !Array.isArray(data)) throw new Error('Comparative analytics failed');

    console.log('\n--- 9. Security: Student accessing Admin endpoint ---');
    res = await fetch(`${baseUrl}/admin/analytics/overview`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    console.log(`Student -> Admin Endpoint status: ${res.status}`);
    if (res.status !== 403) throw new Error('Security test failed');

    console.log('\n--- 10. Testing Admin AI Insights (Sanity Check) ---');
    // 10a. No auth
    res = await fetch(`${baseUrl}/admin/ai-insights`);
    console.log(`No Auth AI Insights Status: ${res.status}`);

    // 10b. Admin auth
    res = await fetch(`${baseUrl}/admin/ai-insights`, { headers: authHeaders });
    const insights = await res.json();
    console.log(`With Auth AI Insights Status: ${res.status}`);
    
    if (res.status === 200 && Array.isArray(insights)) {
      const john = insights.find(i => i.title.includes('John Doe'));
      if (john) {
        console.log(`John Doe Found! Risk Level: ${john.type}, Title: ${john.title}`);
        console.log(`John Doe Evidence: ${john.evidence}`);
      } else {
        console.log('John Doe not found in insights.');
      }
    }

    console.log('\n✅ ALL ADMIN API TESTS PASSED!');
    process.exit(0);
  } catch (err) {
    console.error('❌ TEST FAILED:', err.message);
    process.exit(1);
  } finally {
    console.log('Shutting down server...');
    serverProcess.kill();
  }
}

runTests();
