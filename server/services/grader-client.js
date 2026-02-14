import reviewPolicy from '../config/review-policy.js';

function clampScore(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return reviewPolicy.gradeScale.min;
  return Math.max(reviewPolicy.gradeScale.min, Math.min(reviewPolicy.gradeScale.max, Math.round(num)));
}

function sanitizeGradeResponse(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const feedback = String(payload.feedback || '').trim();
  if (!feedback) return null;
  return {
    score: clampScore(payload.score),
    feedback,
    strengths: Array.isArray(payload.strengths) ? payload.strengths.map((v) => String(v)).slice(0, 3) : [],
    improvements: Array.isArray(payload.improvements) ? payload.improvements.map((v) => String(v)).slice(0, 3) : [],
    provider: payload.provider ? String(payload.provider) : 'external',
  };
}

async function gradeCardResponse({ question, expectedAnswer, userAnswer }) {
  const endpoint = process.env.GRADER_URL;
  if (!endpoint) {
    const error = new Error('GRADER_URL is not configured');
    error.statusCode = 500;
    throw error;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (process.env.GRADER_API_KEY) {
    headers['x-api-key'] = process.env.GRADER_API_KEY;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ question, expectedAnswer, userAnswer }),
  });

  if (!response.ok) {
    const error = new Error(`External grader failed with status ${response.status}`);
    error.statusCode = 502;
    throw error;
  }

  const payload = await response.json();
  const sanitized = sanitizeGradeResponse(payload);
  if (!sanitized) {
    const error = new Error('External grader returned invalid payload');
    error.statusCode = 502;
    throw error;
  }

  return sanitized;
}

export { gradeCardResponse };
