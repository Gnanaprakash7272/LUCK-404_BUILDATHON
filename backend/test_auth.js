const { spawn } = require('child_process');

async function runTests() {
  console.log('Starting server for tests...');
  const serverProcess = spawn('node', ['src/app.js'], { stdio: 'pipe' });

  // Wait a bit for server to start
  await new Promise(resolve => setTimeout(resolve, 2000));

  const baseUrl = 'http://localhost:3000/api';
  let adminToken = '';
  let studentToken = '';

  try {
    console.log('\n--- 1. Testing Register ---');
    // We register a new user so we don't conflict with seed data email (unless we use a random email)
    const randomEmail = `test_student_${Date.now()}@academicpulse.com`;
    let res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Student', email: randomEmail, password: 'password123', role: 'student' })
    });
    let data = await res.json();
    console.log('Register Response:', res.status, data);
    if (res.status !== 201) throw new Error('Registration failed');
    studentToken = data.token;

    console.log('\n--- 2. Testing Login (Valid) ---');
    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@academicpulse.com', password: 'password123' })
    });
    data = await res.json();
    console.log('Login Response:', res.status, data);
    if (res.status !== 200) throw new Error('Login failed');
    adminToken = data.token;

    console.log('\n--- 3. Testing Invalid Login ---');
    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@academicpulse.com', password: 'wrongpassword' })
    });
    data = await res.json();
    console.log('Invalid Login Response:', res.status, data);
    if (res.status !== 401) throw new Error('Invalid login did not return 401');

    console.log('\n--- 4. Testing Protected Route WITH JWT ---');
    res = await fetch(`http://localhost:3000/api/test-protected`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    data = await res.json();
    console.log('Protected Route (Valid) Response:', res.status, data);
    if (res.status !== 200) throw new Error('Protected route failed');

    console.log('\n--- 5. Testing Protected Route WITHOUT JWT ---');
    res = await fetch(`http://localhost:3000/api/test-protected`);
    data = await res.json();
    console.log('Protected Route (No JWT) Response:', res.status, data);
    if (res.status !== 401) throw new Error('Protected route without JWT did not return 401');

    console.log('\n--- 6. Testing Role Middleware (Admin route as Admin) ---');
    res = await fetch(`http://localhost:3000/api/test-admin`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    data = await res.json();
    console.log('Admin Route (As Admin) Response:', res.status, data);
    if (res.status !== 200) throw new Error('Admin route failed for admin');

    console.log('\n--- 7. Testing Role Middleware (Admin route as Student) ---');
    res = await fetch(`http://localhost:3000/api/test-admin`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    data = await res.json();
    console.log('Admin Route (As Student) Response:', res.status, data);
    if (res.status !== 403) throw new Error('Admin route allowed a student (expected 403)');

    console.log('\n✅ ALL AUTH TESTS PASSED!');
  } catch (err) {
    console.error('❌ TEST FAILED:', err.message);
  } finally {
    console.log('Shutting down server...');
    serverProcess.kill();
  }
}

runTests();
