import { gradeCardResponse } from '../services/grader-client.js';
import { assessPunishmentTask, createPunishmentTask } from '../services/punishment-service.js';
import reviewPolicy from '../config/review-policy.js';

async function gradeAnswer(req, res) {
  const { question, expectedAnswer, userAnswer } = req.body || {};
  if (!question || !expectedAnswer) {
    return res.status(400).json({ error: 'question and expectedAnswer are required' });
  }

  const result = await gradeCardResponse({ question, expectedAnswer, userAnswer });
  return res.json({ ...result, lowScoreThreshold: reviewPolicy.lowScoreThreshold });
}

async function createPunishment(req, res) {
  const { question, expectedAnswer, upsetStage } = req.body || {};
  if (!question || !expectedAnswer) {
    return res.status(400).json({ error: 'question and expectedAnswer are required' });
  }

  const punishment = createPunishmentTask({ upsetStage });
  return res.json({ punishment });
}

async function assessPunishment(req, res) {
  const { punishment, submission, expectedAnswer } = req.body || {};
  if (!punishment || !submission) {
    return res.status(400).json({ error: 'punishment and submission are required' });
  }

  const result = await assessPunishmentTask({ punishment, submission, expectedAnswer });
  return res.json(result);
}

function echoDestroy(req, res) {
  console.log('destroy');
  return res.json({ ok: true, echoed: 'destroy' });
}

export { gradeAnswer, createPunishment, assessPunishment, echoDestroy };
