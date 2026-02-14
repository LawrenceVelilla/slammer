import { useEffect, useMemo, useState } from "react";
import BackgroundParticles from "./ui/BackgroundParticles";

const API_BASE = "http://127.0.0.1:3000";
const FINAL_UPSET_STAGE = 5;

const iconStages = [
  "/happy-cat.svg",
  "/concerned-cat.svg",
  "/sad-cat.svg",
  "/shocked-cat.svg",
  "/devious-cat.svg",
  "/demonic-cat.svg",
];

function repositionDeck(cards, score) {
  if (cards.length <= 1) return cards;
  const [current, ...rest] = cards;

  if (score >= 8) {
    return [...rest, current];
  }
  if (score >= 5) {
    const insertAt = Math.max(1, Math.floor(rest.length * 0.6));
    return [...rest.slice(0, insertAt), current, ...rest.slice(insertAt)];
  }

  const insertAt = score <= 3 ? 1 : 2;
  const bounded = Math.min(insertAt, rest.length);
  return [...rest.slice(0, bounded), current, ...rest.slice(bounded)];
}

export default function StudySession() {
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [cards, setCards] = useState([]);
  const [answer, setAnswer] = useState("");
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [punishment, setPunishment] = useState(null);
  const [punishmentInput, setPunishmentInput] = useState("");
  const [upsetStage, setUpsetStage] = useState(0);
  const [destroyTriggered, setDestroyTriggered] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [punishmentFeedback, setPunishmentFeedback] = useState(null);
  const [punishmentContext, setPunishmentContext] = useState(null);
  const [lowScoreThreshold, setLowScoreThreshold] = useState(3);

  const currentCard = cards[0] || null;
  const catSrc = iconStages[Math.min(upsetStage, iconStages.length - 1)];
  const terminalState = upsetStage >= FINAL_UPSET_STAGE ? "Terminal state reached." : "";

  useEffect(() => {
    let cancelled = false;

    async function loadDecks() {
      try {
        const response = await fetch(`${API_BASE}/decks`);
        if (!response.ok) throw new Error("Failed to load decks");
        const payload = await response.json();
        if (!cancelled) {
          setDecks(payload.decks || []);
          setSelectedDeckId((payload.decks && payload.decks[0]?._id) || "");
        }
      } catch (error) {
        if (!cancelled) setLoadError(error.message);
      }
    }

    loadDecks();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadCards() {
      if (!selectedDeckId) {
        setCards([]);
        return;
      }
      try {
        setLoadError("");
        const response = await fetch(`${API_BASE}/decks/${selectedDeckId}/cards?limit=200&page=1`);
        if (!response.ok) throw new Error("Failed to load cards");
        const payload = await response.json();
        if (!cancelled) {
          setCards(payload.cards || []);
          setAnswer("");
          setFeedback(null);
          setPunishment(null);
          setPunishmentInput("");
          setPunishmentFeedback(null);
          setPunishmentContext(null);
        }
      } catch (error) {
        if (!cancelled) setLoadError(error.message);
      }
    }
    loadCards();
    return () => {
      cancelled = true;
    };
  }, [selectedDeckId]);

  async function triggerDestroy() {
    if (destroyTriggered) return;
    setDestroyTriggered(true);
    console.log("destroy");
    try {
      await fetch(`${API_BASE}/chat/destroy`, { method: "POST" });
    } catch {
      // Local console echo already happened.
    }
  }

  async function requestPunishment(card, scoreValue) {
    const response = await fetch(`${API_BASE}/chat/punishment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: card.front,
        expectedAnswer: card.back,
        score: scoreValue,
        upsetStage,
      }),
    });
    if (!response.ok) throw new Error("Failed to create punishment");
    const payload = await response.json();
    return payload.punishment || null;
  }

  async function submitAnswer(event) {
    event.preventDefault();
    if (!currentCard || grading) return;

    setGrading(true);
    const activeCard = currentCard;
    try {
      const response = await fetch(`${API_BASE}/chat/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentCard.front,
          expectedAnswer: currentCard.back,
          userAnswer: answer,
        }),
      });
      if (!response.ok) throw new Error("Grading failed");

      const result = await response.json();
      const score = Number(result.score || 1);
      const threshold = Number(result.lowScoreThreshold || 3);
      setLowScoreThreshold(threshold);

      setFeedback({
        score,
        text: result.feedback || "No feedback returned.",
      });
      setCards((previous) => repositionDeck(previous, score));
      setAnswer("");
      setPunishmentFeedback(null);

      if (score <= threshold) {
        const nextPunishment = await requestPunishment(activeCard, score);
        setPunishment(nextPunishment);
        setPunishmentContext({
          question: activeCard.front,
          expectedAnswer: activeCard.back,
        });
        setPunishmentInput("");
      } else {
        setPunishment(null);
        setPunishmentContext(null);
      }
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setGrading(false);
    }
  }

  async function submitPunishment(event) {
    event.preventDefault();
    if (!punishment) return;

    try {
      const response = await fetch(`${API_BASE}/chat/punishment/assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          punishment,
          submission: punishmentInput,
          expectedAnswer: punishmentContext?.expectedAnswer || "",
        }),
      });
      if (!response.ok) throw new Error("Punishment assessment failed");
      const result = await response.json();
      setPunishmentFeedback(result.feedback || null);

      if (result.passed) {
        setPunishment(null);
        setPunishmentInput("");
        setPunishmentContext(null);
        return;
      }

      const nextStage = Math.min(FINAL_UPSET_STAGE, upsetStage + 1);
      setUpsetStage(nextStage);
      setPunishment(null);
      setPunishmentInput("");
      setPunishmentContext(null);
      if (nextStage >= FINAL_UPSET_STAGE) {
        await triggerDestroy();
      }
    } catch (error) {
      setLoadError(error.message);
    }
  }

  const deckLabel = useMemo(() => {
    const deck = decks.find((item) => item._id === selectedDeckId);
    return deck ? deck.name : "No deck selected";
  }, [decks, selectedDeckId]);

  return (
    <div className="relative min-h-screen w-full bg-charcoal overflow-hidden text-white">
      <BackgroundParticles />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-4xl font-bold tracking-tight">Study Stack</h1>
        <p className="mt-2 text-white/80">Answer, get graded by AI (1-10), and survive punishments.</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label htmlFor="deck" className="text-sm text-white/80">
            Deck
          </label>
          <select
            id="deck"
            className="rounded-md bg-zinc-900 px-3 py-2"
            value={selectedDeckId}
            onChange={(event) => setSelectedDeckId(event.target.value)}
          >
            {decks.map((deck) => (
              <option key={deck._id} value={deck._id}>
                {deck.name}
              </option>
            ))}
          </select>
          <span className="text-sm text-white/60">{deckLabel}</span>
        </div>

        {loadError ? <p className="mt-4 text-red-400">{loadError}</p> : null}

        {!currentCard ? (
          <p className="mt-8 text-lg text-white/80">No cards loaded for this deck.</p>
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-[1fr_220px]">
            <div className="rounded-xl bg-zinc-900/80 p-6">
              <p className="text-sm uppercase tracking-wide text-white/60">Prompt</p>
              <p className="mt-2 text-2xl">{currentCard.front}</p>

              <form onSubmit={submitAnswer} className="mt-6 space-y-3">
                <textarea
                  className="h-32 w-full rounded-md bg-zinc-800 p-3 outline-none ring-green-vivid/60 focus:ring-2"
                  placeholder="Type your answer..."
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                />
                <button
                  type="submit"
                  disabled={grading}
                  className="rounded-md bg-green-vivid px-5 py-2 font-semibold text-white disabled:opacity-50"
                >
                  {grading ? "Grading..." : "Submit Answer"}
                </button>
              </form>

              {feedback ? (
                <div className="mt-6 rounded-lg border border-zinc-700 p-4">
                  <p className="text-sm text-white/70">Score</p>
                  <p className="text-3xl font-bold">{feedback.score}/10</p>
                  <p className="mt-2 text-white/85">{feedback.text}</p>
                  <p className="mt-2 text-xs text-white/60">Punishment threshold: {lowScoreThreshold}</p>
                </div>
              ) : null}

              {punishment ? (
                <form onSubmit={submitPunishment} className="mt-6 rounded-lg border border-red-500/40 bg-red-950/30 p-4">
                  <p className="text-sm uppercase tracking-wide text-red-300">Punishment Required</p>
                  <p className="mt-2 text-red-100 font-semibold">{punishment.title}</p>
                  <p className="mt-2 text-red-100">{punishment.instructions}</p>
                  <p className="mt-2 text-xs text-red-200/80">Success criteria: {punishment.successCriteria}</p>
                  <input
                    className="mt-3 w-full rounded-md bg-zinc-800 p-2 outline-none ring-red-400/60 focus:ring-2"
                    value={punishmentInput}
                    onChange={(event) => setPunishmentInput(event.target.value)}
                    placeholder="Complete punishment task"
                  />
                  <button type="submit" className="mt-3 rounded-md bg-red-600 px-4 py-2 font-semibold">
                    Submit Punishment
                  </button>
                  <p className="mt-2 text-xs text-red-200/80">
                    AI will assess if the punishment was completed.
                  </p>
                </form>
              ) : null}

              {punishmentFeedback ? <p className="mt-3 text-sm text-white/75">{punishmentFeedback}</p> : null}
            </div>

            <div className="flex flex-col items-center rounded-xl bg-zinc-900/80 p-4">
              <p className="text-sm uppercase tracking-wide text-white/60">Mood</p>
              <img src={catSrc} alt="Mood icon" className="mt-4 w-40 select-none" draggable={false} />
              <p className="mt-3 text-center text-sm text-white/80">Upset Stage: {upsetStage}</p>
              {terminalState ? <p className="mt-2 text-center text-xs text-red-300">{terminalState}</p> : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
