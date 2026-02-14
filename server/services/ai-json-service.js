import openai from '../utils/openai.js';

function extractJson(text) {
  const raw = String(text || '').trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

async function runAiJson({ systemPrompt, userPrompt, model }) {
  if (!openai || !process.env.OPENAI_API_KEY) return null;

  const response = await openai.responses.create({
    model: model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
    input: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  return extractJson(response.output_text || '');
}

export { runAiJson };
