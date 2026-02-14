import { Router } from "express";
import openai from "../utils/openai.js";


const grading_prmpt = `You are a flashcard grading assistant. The user is studying with Anki cards.
                            Given the question, the correct answer, and the user's answer, score the user's answer from 1 to 10.
                            - 10 = perfect or essentially correct
                            - 7-9 = mostly correct, minor issues
                            - 4-6 = partially correct
                            - 1-3 = mostly wrong
                            Respond with ONLY a JSON object: { "score": <number>, "feedback": "<brief explanation>" }`

const router = Router();

router.post("/grade", async (req, res) => {
    const { question, expectedAnswer, userAnswer } = req.body;

    if (!question || !expectedAnswer || !userAnswer) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: grading_prmpt
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
});

export default router;