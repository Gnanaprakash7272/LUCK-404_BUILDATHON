const { generateStudentEvidence } = require('./deterministicEngine');

// The fallback generator ensures we ALWAYS have a response if the LLM fails
const generateFallback = (evidence, audience) => {
  let explanation = '';
  let recommendation = '';

  const weakSubjectString = evidence.weak_subject !== 'None' 
    ? `The weakest subject is ${evidence.weak_subject} (${evidence.weak_subject_avg}%). ` 
    : '';

  const pendingString = evidence.pending_assignments > 0 
    ? `There are ${evidence.pending_assignments} pending assignments. ` 
    : '';

  if (audience === 'student') {
    explanation = `Your current academic data indicates a ${evidence.risk_level} risk level. Your overall attendance is ${evidence.attendance_pct}%. ${weakSubjectString}Your recent performance trend is ${evidence.trend}. ${pendingString}`;
    recommendation = `Focus on improving your attendance. Prioritize studying for ${evidence.weak_subject} and ensure all pending assignments are submitted.`;
  } else if (audience === 'teacher') {
    explanation = `This student is currently at a ${evidence.risk_level} risk level. Attendance is ${evidence.attendance_pct}%. ${weakSubjectString}Performance trend is ${evidence.trend}. ${pendingString}`;
    recommendation = `Consider a 1-on-1 intervention focusing on ${evidence.weak_subject}. Follow up on the pending assignments.`;
  } else if (audience === 'admin') {
    explanation = `Student is flagged as ${evidence.risk_level} risk. Attendance: ${evidence.attendance_pct}%, Trend: ${evidence.trend}. ${weakSubjectString}${pendingString}`;
    recommendation = `Monitor this student's progress and ensure teacher interventions are scheduled if risk level persists.`;
  }

  return {
    explanation,
    recommendation,
    source: 'fallback'
  };
};

const getLLMExplanation = async (evidence, audience, customFetch = fetch) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateFallback(evidence, audience);
  }

  const prompt = `
You are an academic intelligence assistant. Based on the following deterministic data, generate a short explanation and recommendation.
Do not invent new metrics. Do not change the risk level. Do not hallucinate facts.

Data:
Risk Level: ${evidence.risk_level}
Risk Score: ${evidence.risk_score}
Attendance: ${evidence.attendance_pct}%
Weakest Subject: ${evidence.weak_subject} (${evidence.weak_subject_avg}%)
Pending Assignments: ${evidence.pending_assignments}
Trend: ${evidence.trend}

Audience: ${audience}

Return the response STRICTLY as a JSON object with two string fields:
{
  "explanation": "Brief explanation of why they have this risk level based on the data",
  "recommendation": "Brief actionable recommendation based on the data"
}
`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await customFetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: 'application/json', temperature: 0.2 }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return generateFallback(evidence, audience);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      return generateFallback(evidence, audience);
    }

    const text = data.candidates[0].content.parts[0].text;
    if (!text || text.trim() === '') {
      return generateFallback(evidence, audience);
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return generateFallback(evidence, audience);
    }

    if (!parsed.explanation || !parsed.recommendation) {
      return generateFallback(evidence, audience);
    }

    return {
      explanation: parsed.explanation,
      recommendation: parsed.recommendation,
      source: 'llm'
    };
  } catch (error) {
    // Catch timeouts or network errors
    return generateFallback(evidence, audience);
  }
};

module.exports = {
  getLLMExplanation,
  generateFallback
};
