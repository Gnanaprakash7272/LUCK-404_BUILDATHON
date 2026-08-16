const db = require('../db/database');
const { generateStudentEvidence } = require('./deterministicEngine');
const { getLLMExplanation } = require('./llmService');

const getOrGenerateInsight = async (studentId, audience = 'student') => {
  // Check if insight exists
  const existingInsight = db.prepare(`
    SELECT id, risk_level, risk_score, weak_subject, trend, pending_assignments, evidence_json as evidence, explanation, recommendation, generated_at
    FROM ai_insights
    WHERE student_id = ?
    ORDER BY generated_at DESC LIMIT 1
  `).get(studentId);

  if (existingInsight) {
    if (existingInsight.evidence) {
      existingInsight.evidence = JSON.parse(existingInsight.evidence);
    }
    return existingInsight;
  }

  // Generate new insight
  const evidence = generateStudentEvidence(studentId);
  const llmResult = await getLLMExplanation(evidence, audience);

  const info = db.prepare(`
    INSERT INTO ai_insights (student_id, risk_score, risk_level, weak_subject, trend, pending_assignments, evidence_json, explanation, recommendation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    studentId,
    evidence.risk_score,
    evidence.risk_level,
    evidence.weak_subject,
    evidence.trend,
    evidence.pending_assignments,
    JSON.stringify(evidence),
    llmResult.explanation,
    llmResult.recommendation
  );

  return {
    id: info.lastInsertRowid,
    student_id: studentId,
    risk_score: evidence.risk_score,
    risk_level: evidence.risk_level,
    weak_subject: evidence.weak_subject,
    trend: evidence.trend,
    pending_assignments: evidence.pending_assignments,
    evidence,
    explanation: llmResult.explanation,
    recommendation: llmResult.recommendation,
    generated_at: new Date().toISOString()
  };
};

module.exports = {
  getOrGenerateInsight
};
