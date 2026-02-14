import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackgroundParticles from "./ui/BackgroundParticles";
import AnimatedStopwatch from "./ui/AnimatedStopwatch";

/* ── Config ── */
// TODO: CHANGE THIS LATER TO ACCEPT A TIME LIMIT FROM THE QUESTION
const TOTAL_TIME = 20; // seconds (testing value; design implies 600 = 10:00)

/* ── Helpers ── */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getTimerColor(pct) {
  if (pct >= 50) return "#22c55e"; // green-500
  if (pct >= 25) return "#f97316"; // orange-500
  return "#ef4444";                // red-500
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

/* ── Component ── */
export default function QuestionPage() {
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const inputRef = useRef(null);

  /* ── Countdown ── */
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const percentage = (timeLeft / TOTAL_TIME) * 100;
  const timerColor = getTimerColor(percentage);
  const catSrc = getCatSrc(percentage);
  const catAlt = getCatAlt(percentage);

  return (
    <motion.div
      className="relative min-h-screen w-full bg-charcoal overflow-hidden flex flex-col items-center select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* ── Background particles (z-0) ── */}
      <BackgroundParticles />

      {/* ── Foreground content (z-10) ── */}
      <div className="mt-12 relative z-10 flex flex-col items-center w-full max-w-4xl px-6 pt-10 sm:pt-16">
        {/* ── Header Row: Title (center) + Timer (right) ── */}
        <div className="w-full flex items-center justify-center gap-6">
          {/* Invisible spacer – same width as timer block so title stays centred */}
          <div className="w-36 sm:w-44 shrink-0 hidden sm:block" />

          {/* Title */}
          <motion.h1
            className="text-white text-4xl sm:text-5xl md:text-6xl font-bold italic tracking-tight text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            A Question Appeared!
          </motion.h1>

          {/* Timer */}
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

        {/* ── Question Text ── */}
        <motion.p
          className="text-white/60 text-lg sm:text-xl md:text-2xl font-medium text-center mt-10 sm:mt-14 leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Where did Napoleon suffer his final defeat?
        </motion.p>

        {/* ── Input Field ── */}
        <motion.div
          className="w-full max-w-2xl mt-10 sm:mt-14"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-full rounded-full shadow-lg" style={{ backgroundColor: "#c8c8ce" }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter your answer here"
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
        </motion.div>

        {/* ── Dynamic Cat ── */}
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
      </div>
    </motion.div>
  );
}
