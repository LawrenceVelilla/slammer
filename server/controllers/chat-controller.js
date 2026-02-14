import { assessPunishmentTask, createPunishmentTask } from '../services/punishment-service.js';
import reviewPolicy from '../config/review-policy.js';
import openai from '../utils/openai.js';

const grading_prompt = `You are a flashcard grading assistant. The user is studying with Anki cards.
Given the question, the correct answer, and the user's answer, score the user's answer from 1 to 10.
- 10 = perfect or essentially correct
- 7-9 = mostly correct, minor issues
- 4-6 = partially correct
- 1-3 = mostly wrong
Respond with ONLY a JSON object: { "score": <number>, "feedback": "<brief explanation>" }`;

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

async function gradeAnswer(req, res){
    const { question, expectedAnswer, userAnswer } = req.body;

    if (!question || !expectedAnswer || !userAnswer) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: grading_prompt
            },
            {
                role: "user",
                content: `Question: ${question}\nCorrect answer: ${expectedAnswer}\nUser's answer: ${userAnswer}`,
            },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);
};

export { createPunishment, assessPunishment, echoDestroy, gradeAnswer };
