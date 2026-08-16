const db = require('./src/db/database');
const { generateStudentEvidence } = require('./src/ai/deterministicEngine');
const { getLLMExplanation } = require('./src/ai/llmService');

// Mock Gemini API responses
const createMockFetch = (scenario) => {
  return async (url, options) => {
    if (scenario === 'provider_failure') {
      return { ok: false, status: 500 };
    }
    if (scenario === 'timeout') {
      throw new Error('AbortError');
    }
    if (scenario === 'empty') {
      return { ok: true, json: async () => ({ candidates: [] }) };
    }
    if (scenario === 'malformed') {
      return {
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: '{"explanation": "bad json' }] } }]
        })
      };
    }
    if (scenario === 'success') {
      return {
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  explanation: 'Mocked LLM explanation.',
                  recommendation: 'Mocked LLM recommendation.'
                })
              }]
            }
          }]
        })
      };
    }
  };
};

async function runTests() {
  console.log('--- STAGE 6B: LLM EXPLANATION TESTS ---\n');

  try {
    // We need John Doe's evidence first
    const john = db.prepare("SELECT id FROM users WHERE email = 'john@academicpulse.com'").get();
    if (!john) throw new Error("John Doe not found");
    const evidence = generateStudentEvidence(john.id);
    
    // Save original GEMINI_API_KEY
    const originalApiKey = process.env.GEMINI_API_KEY;
    
    console.log('=== 1. FALLBACK TESTS ===');
    
    // Test 2: Missing API key
    process.env.GEMINI_API_KEY = '';
    let result = await getLLMExplanation(evidence, 'student');
    console.log('Missing API Key ->', result.source === 'fallback' ? 'PASS' : 'FAIL');
    
    // Set dummy key to trigger mock fetches
    process.env.GEMINI_API_KEY = 'dummy_key';
    
    // Test 3: Provider failure
    result = await getLLMExplanation(evidence, 'student', createMockFetch('provider_failure'));
    console.log('Provider Failure (500) ->', result.source === 'fallback' ? 'PASS' : 'FAIL');
    
    // Test 4: Timeout
    result = await getLLMExplanation(evidence, 'student', createMockFetch('timeout'));
    console.log('Timeout / Network Error ->', result.source === 'fallback' ? 'PASS' : 'FAIL');
    
    // Test 5: Malformed JSON
    result = await getLLMExplanation(evidence, 'student', createMockFetch('malformed'));
    console.log('Malformed JSON ->', result.source === 'fallback' ? 'PASS' : 'FAIL');
    
    // Test 6: Empty Response
    result = await getLLMExplanation(evidence, 'student', createMockFetch('empty'));
    console.log('Empty Response ->', result.source === 'fallback' ? 'PASS' : 'FAIL');
    
    // Test 1: Valid LLM Response
    result = await getLLMExplanation(evidence, 'student', createMockFetch('success'));
    console.log('Valid LLM Response ->', result.source === 'llm' ? 'PASS' : 'FAIL');

    // Test 8/9/10: Audience (Fallback checks formatting differences)
    const stu = await getLLMExplanation(evidence, 'student', createMockFetch('provider_failure'));
    const tea = await getLLMExplanation(evidence, 'teacher', createMockFetch('provider_failure'));
    const adm = await getLLMExplanation(evidence, 'admin', createMockFetch('provider_failure'));
    
    console.log('Student Audience Text Formatting ->', stu.explanation.includes('Your') ? 'PASS' : 'FAIL');
    console.log('Teacher Audience Text Formatting ->', tea.recommendation.includes('1-on-1') ? 'PASS' : 'FAIL');
    console.log('Admin Audience Text Formatting ->', adm.recommendation.includes('Monitor') ? 'PASS' : 'FAIL');

    // Restore key
    process.env.GEMINI_API_KEY = originalApiKey;

    console.log('\n=== 11. JOHN DOE DEMO (USING FALLBACK AS DEFAULT WITHOUT KEY) ===');
    const demoResult = await getLLMExplanation(evidence, 'student');
    console.log('Explanation:\n' + demoResult.explanation + '\n');
    console.log('Recommendation:\n' + demoResult.recommendation + '\n');
    console.log('Source:', demoResult.source);

    // Verify determinism constraint
    console.log('\n=== 12. DETERMINISM CHECK ===');
    const evidenceCheck = generateStudentEvidence(john.id);
    console.log('Deterministic Risk Value changed?', evidence.risk_score !== evidenceCheck.risk_score ? 'YES (FAIL)' : 'NO (PASS)');
    console.log('Weak Subject changed?', evidence.weak_subject !== evidenceCheck.weak_subject ? 'YES (FAIL)' : 'NO (PASS)');
    console.log('Trend changed?', evidence.trend !== evidenceCheck.trend ? 'YES (FAIL)' : 'NO (PASS)');

  } catch (err) {
    console.error('❌ TEST FAILED:', err);
  }

  console.log('\n✅ ALL STAGE 6B TESTS COMPLETED!');
}

runTests();
