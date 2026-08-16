const { spawn } = require('child_process');
const db = require('./src/db/database');
const { generateStudentEvidence } = require('./src/ai/deterministicEngine');

async function runTests() {
  console.log('--- STAGE 6C: AI API INTEGRATION TESTS ---\n');
  
  // Clear existing AI insights to test "missing triggers generation"
  db.prepare("DELETE FROM ai_insights").run();

  const s = db.prepare("SELECT id, email FROM users WHERE role='student' LIMIT 1").get();
  const t = db.prepare("SELECT id, email FROM users WHERE role='teacher' LIMIT 1").get();

  console.log('Starting server for Stage 6C API tests...');
  const serverProcess = spawn('node', ['src/app.js'], { stdio: 'pipe' });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const baseUrl = 'http://localhost:3000/api';
  let studentToken = '';
  let teacherToken = '';

  try {
    let res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: s.email, password: 'password123' })
    });
    let data = await res.json();
    studentToken = data.token;

    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: t.email, password: 'password123' })
    });
    data = await res.json();
    teacherToken = data.token;

    // Set fake key so LLM falls back or use missing key
    process.env.GEMINI_API_KEY = '';

    // 1. Missing insight triggers generation (Student API)
    res = await fetch(`${baseUrl}/students/me/ai-insight`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const insightData = await res.json();
    console.log('1. Student Insight Generation:', res.status === 200 && insightData.risk_level ? 'PASS' : `FAIL (${res.status})`);
    const initialInsightId = insightData.id;

    // 2. Existing insight reused correctly
    res = await fetch(`${baseUrl}/students/me/ai-insight`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const insightData2 = await res.json();
    console.log('2. Insight Reused Correctly:', insightData2.id === initialInsightId ? 'PASS' : 'FAIL');

    // 3. No JWT -> 401
    res = await fetch(`${baseUrl}/students/me/ai-insight`);
    console.log('3. Student API No JWT -> 401:', res.status === 401 ? 'PASS' : 'FAIL');

    // 4. Teacher -> Student Endpoint -> 403
    res = await fetch(`${baseUrl}/students/me/ai-insight`, {
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    console.log('4. Teacher -> Student API -> 403:', res.status === 403 ? 'PASS' : 'FAIL');

    // 5. GET /api/teacher/me/at-risk-students
    res = await fetch(`${baseUrl}/teacher/me/at-risk-students`, {
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const atRiskData = await res.json();
    let sortedCorrectly = true;
    for (let i = 0; i < atRiskData.length - 1; i++) {
      if (atRiskData[i].risk_score < atRiskData[i+1].risk_score) sortedCorrectly = false;
    }
    console.log('5. Teacher At-Risk Endpoint (Generation & Fetch):', res.status === 200 && Array.isArray(atRiskData) ? 'PASS' : 'FAIL');
    console.log('6. Teacher At-Risk Sorted By Score:', sortedCorrectly ? 'PASS' : 'FAIL');

    // 7. No JWT -> 401
    res = await fetch(`${baseUrl}/teacher/me/at-risk-students`);
    console.log('7. Teacher API No JWT -> 401:', res.status === 401 ? 'PASS' : 'FAIL');

    // 8. Student -> Teacher Endpoint -> 403
    res = await fetch(`${baseUrl}/teacher/me/at-risk-students`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    console.log('8. Student -> Teacher API -> 403:', res.status === 403 ? 'PASS' : 'FAIL');

    // 9. Determinism checks
    const expected = generateStudentEvidence(s.id);
    console.log('9. Deterministic Risk Remains Unchanged:', insightData.risk_score === expected.risk_score ? 'PASS' : 'FAIL');
    console.log('10. Weak Subject Remains Unchanged:', insightData.weak_subject === expected.weak_subject ? 'PASS' : 'FAIL');
    console.log('11. Trend Remains Unchanged:', insightData.trend === expected.trend ? 'PASS' : 'FAIL');

    console.log('\n=== JOHN DOE AI INSIGHT API RESPONSE ===');
    const john = db.prepare("SELECT id, email FROM users WHERE email='john@academicpulse.com'").get();
    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: john.email, password: 'password123' })
    });
    const johnData = await res.json();
    const johnToken = johnData.token;
    
    res = await fetch(`${baseUrl}/students/me/ai-insight`, {
      headers: { 'Authorization': `Bearer ${johnToken}` }
    });
    console.log(JSON.stringify(await res.json(), null, 2));

    console.log('\n=== TEACHER AT-RISK API RESPONSE ===');
    const alan = db.prepare("SELECT id, email FROM users WHERE email='alan@academicpulse.com'").get();
    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: alan.email, password: 'password123' })
    });
    const alanData = await res.json();
    const alanToken = alanData.token;

    res = await fetch(`${baseUrl}/teacher/me/at-risk-students`, {
      headers: { 'Authorization': `Bearer ${alanToken}` }
    });
    console.log(JSON.stringify(await res.json(), null, 2));

  } catch (err) {
    console.error('❌ TEST FAILED:', err);
  } finally {
    console.log('Shutting down server...');
    serverProcess.kill();
  }

  console.log('\n✅ ALL STAGE 6C TESTS COMPLETED!');
}

runTests();
