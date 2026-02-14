import reviewPolicy from '../config/review-policy.js';
import punishments from '../config/punishments.js';
import { runAiJson } from './ai-json-service.js';

function createPunishmentTask({ upsetStage = 0 }) {
  if (!Array.isArray(punishments) || punishments.length === 0) {
    const error = new Error('No punishments configured');
    error.statusCode = 500;
    throw error;
  }

  const index = Math.max(0, Number(upsetStage) || 0) % punishments.length;
  return {
    ...punishments[index],
    provider: 'config',
    maxWords: Math.max(10, Math.min(200, Number(punishments[index].maxWords) || reviewPolicy.punishment.maxWords)),
  };
}

function sanitizeAssessment(ai) {
  if (!ai || typeof ai !== 'object') return null;
  const passed = Boolean(ai.passed);
  const score = Math.max(1, Math.min(10, Math.round(Number(ai.score) || (passed ? 7 : 2))));
  const feedback = String(ai.feedback || '').trim();
  if (!feedback) return null;
  return { passed, score, feedback, provider: 'ai' };
}

function fallbackAssessment({ submission }) {
  const wordCount = String(submission || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const passed = wordCount >= reviewPolicy.punishment.minWords;
  return {
    passed,
    score: passed ? 7 : 2,
    feedback: passed ? 'Punishment completed.' : 'Punishment response too short.',
    provider: 'rule',
  };
}

async function assessPunishmentTask({ punishment, submission, expectedAnswer }) {
  const systemPrompt =
    'Assess if a punishment task submission satisfies the task. Return strict JSON with keys: passed (boolean), score (1-10), feedback.';
  const userPrompt = [
    `Punishment title: ${punishment?.title || ''}`,
    `Punishment instructions: ${punishment?.instructions || ''}`,
    `Success criteria: ${punishment?.successCriteria || ''}`,
    `Expected answer reference: ${expectedAnswer || ''}`,
    `User submission: ${submission || ''}`,
  ].join('\n');

  try {
    const aiResult = sanitizeAssessment(await runAiJson({ systemPrompt, userPrompt }));
    if (aiResult) return aiResult;
  } catch {
    // Graceful fallback.
  }

  return fallbackAssessment({ submission });
}

export { createPunishmentTask, assessPunishmentTask };
