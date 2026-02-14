import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BackgroundParticles from "./ui/BackgroundParticles";
import AnimatedStopwatch from "./ui/AnimatedStopwatch";
import { useSession } from "../context/SessionContext";

const DEFAULT_TIME = 20;
const API_BASE = "http://localhost:3000";
const CORRECT_SCORE_THRESHOLD = 4;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getTimerColor(pct) {
  if (pct >= 50) return "#22c55e";
  if (pct >= 25) return "#f97316";
  return "#ef4444";
}

function getCatSrc(pct) {
  if (pct >= 50) return "/smirking-cat.svg";
  if (pct >= 25) return "/concerned-cat.svg";
  return "/shocked-cat.svg";
}

function getCatAlt(pct) {
  if (pct >= 50) return "Smirking cat";
  if (pct >= 25) return "Concerned cat";
  return "Shocked cat";
}

export default function QuestionPage() {
  const [timeLimit, setTimeLimit] = useState(DEFAULT_TIME);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [answer, setAnswer] = useState("");
  const [grading, setGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState(null);
  const [error, setError] = useState("");
  const timeoutHandledRef = useRef(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { currentCard, catLives, decrementCat } = useSession();

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTimeEstimate() {
      if (!currentCard) {
        setTimeLimit(DEFAULT_TIME);
        setTimeLeft(DEFAULT_TIME);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/chat/time-estimate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: currentCard.front,
            expectedAnswer: currentCard.back,
          }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Failed to estimate time");
        const seconds = Number(payload.seconds) || DEFAULT_TIME;
        if (!cancelled) {
          setTimeLimit(seconds);
          setTimeLeft(seconds);
        }
      } catch {
        if (!cancelled) {
          setTimeLimit(DEFAULT_TIME);
          setTimeLeft(DEFAULT_TIME);
        }
      }
    }

    loadTimeEstimate();
    return () => {
      cancelled = true;
    };
  }, [currentCard]);

  useEffect(() => {
    timeoutHandledRef.current = false;
  }, [currentCard?._id, timeLimit]);

  useEffect(() => {
    if (timeLeft > 0 || grading || timeoutHandledRef.current) return;
    timeoutHandledRef.current = true;
    const timeoutFeedback = "Time ran out. Auto-failed.";
    setGradeResult({ score: 0, feedback: timeoutFeedback });
    setError("Time is up.");
    const nextStrikesRemaining = Math.max(0, Number(catLives || 0) - 1);
    decrementCat();
    navigate("/failure", {
      state: { feedback: timeoutFeedback, score: 0, strikesRemaining: nextStrikesRemaining },
    });
  }, [catLives, decrementCat, grading, navigate, timeLeft]);

  const percentage = (timeLeft / timeLimit) * 100;
  const timerColor = getTimerColor(percentage);
  const catSrc = getCatSrc(percentage);
  const catAlt = getCatAlt(percentage);

  async function onSubmit(event) {
    event.preventDefault();
    if (!currentCard || !answer.trim() || grading) return;

    setGrading(true);
    setError("");
    setGradeResult(null);

    try {
      const response = await fetch(`${API_BASE}/chat/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentCard.front,
          expectedAnswer: currentCard.back,
          userAnswer: answer.trim(),
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Failed to grade answer");

      setGradeResult(payload);

      if (Number(payload.score) >= CORRECT_SCORE_THRESHOLD) {
        navigate("/success", {
          state: { feedback: payload.feedback || "", score: Number(payload.score) || 0 },
        });
        return;
      }

      const nextStrikesRemaining = Math.max(0, Number(catLives || 0) - 1);
      decrementCat();
      navigate("/failure", {
        state: {
          feedback: payload.feedback || "",
          score: Number(payload.score) || 0,
          strikesRemaining: nextStrikesRemaining,
        },
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setGrading(false);
    }
  }

  return (
    <motion.div
      className="relative min-h-screen w-full bg-charcoal overflow-hidden flex flex-col items-center select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <BackgroundParticles />

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-6 pt-10 sm:pt-16">
        <div className="w-full flex items-center justify-center gap-6">
          <div className="w-36 sm:w-44 shrink-0 hidden sm:block" />

          <motion.h1
            className="text-white text-4xl sm:text-5xl md:text-6xl font-bold italic tracking-tight text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            A Question Appeared!
          </motion.h1>

          <motion.div
            className="shrink-0 flex items-center gap-2"
            style={{ color: timerColor, transition: "color 500ms" }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          >
            <span className="text-3xl sm:text-4xl font-bold tabular-nums leading-none">
              {formatTime(timeLeft)}
            </span>
            <AnimatedStopwatch size={44} rpm={15} />
          </motion.div>
        </div>

        <motion.p
          className="text-white/60 text-lg sm:text-xl md:text-2xl font-medium text-center mt-10 sm:mt-14 leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {currentCard?.front || "No current card selected. Return to waiting page."}
        </motion.p>

        <motion.form
          className="w-full max-w-2xl mt-10 sm:mt-14"
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-full rounded-full shadow-lg" style={{ backgroundColor: "#c8c8ce" }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter your answer here"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              className="
                w-full rounded-full
                bg-transparent text-zinc-900
                text-lg sm:text-xl font-medium
                px-8 py-4
                placeholder:text-zinc-500 placeholder:font-normal
                outline-none
                focus:ring-2 focus:ring-white/40
                transition-shadow duration-200
              "
            />
          </div>
          <button
            type="submit"
            disabled={grading || !answer.trim()}
            className="mt-4 px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            {grading ? "Grading..." : "Submit Answer"}
          </button>
        </motion.form>

        {error ? <p className="mt-3 text-red-400 text-sm">{error}</p> : null}
        {gradeResult ? (
          <div className="mt-4 text-center">
            <p className="text-white/90 text-base">Score: {gradeResult.score}/10</p>
            <p className="text-white/70 text-sm mt-1">{gradeResult.feedback}</p>
          </div>
        ) : null}

        <div className="mt-10 sm:mt-14 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.img
              key={catSrc}
              src={catSrc}
              alt={catAlt}
              draggable={false}
              className="w-44 sm:w-52 md:w-60"
              initial={{ opacity: 0, scale: 0.8, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            />
          </AnimatePresence>
        </div>

        {import.meta.env.VITE_DEBUG === "true" && (
          <motion.button
            onClick={() => navigate("/waiting")}
            className="mt-8 px-6 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white font-semibold text-sm transition-colors cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          Back to Waiting
        </motion.button>)}
      </div>
    </motion.div>
  );
}
