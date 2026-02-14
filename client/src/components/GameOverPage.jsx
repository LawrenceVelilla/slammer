import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import MatrixRain from "./effects/MatrixRain";

/* ── Entrance helper — each item fades + slides up with a stagger delay ── */
function entrance(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  };
}

/* ── Floating animation for the cat ── */
const floatAnimation = {
  y: [0, -14, 0],
};

const floatTransition = {
  y: {
    duration: 3.5,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

/* ── Red glow pulse ── */
const glowPulse = {
  opacity: [0.5, 0.85, 0.5],
};

const glowTransition = {
  opacity: {
    duration: 2.5,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const COUNTDOWN_SECONDS = 5;

export default function GameOverPage() {
  const location = useLocation();
  const strikeNumber = location.state?.strikeNumber ?? 3;

  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [punishmentDone, setPunishmentDone] = useState(false);
  const [punishmentError, setPunishmentError] = useState("");
  const punishmentRan = useRef(false);

  /* ── Countdown tick ── */
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  /* ── Execute punishment when countdown expires ── */
  useEffect(() => {
    if (secondsLeft > 0 || punishmentRan.current) return;
    punishmentRan.current = true;

    async function run() {
      try {
        if (window.slammer?.executePunishment) {
          await window.slammer.executePunishment(strikeNumber, "hard");
        }
      } catch (error) {
        setPunishmentError(error?.message || "Punishment execution failed.");
      } finally {
        setPunishmentDone(true);
      }
    }

    run();
  }, [secondsLeft, strikeNumber]);

  return (
    <div className="relative min-h-screen w-full bg-charcoal overflow-hidden flex items-center justify-center select-none">
      {/* ── Matrix Rain — Left ── */}
      <div className="absolute inset-y-0 left-0 w-[15%] z-0 pointer-events-none">
        <MatrixRain
          width="100%"
          height="100%"
          fontSize={14}
          speed={1}
          color="#00ff41"
        />
      </div>

      {/* ── Matrix Rain — Right ── */}
      <div className="absolute inset-y-0 right-0 w-[15%] z-0 pointer-events-none">
        <MatrixRain
          width="100%"
          height="100%"
          fontSize={14}
          speed={1}
          color="#00ff41"
        />
      </div>

      {/* ── Centre content ── */}
      <div className="mt-4 mb-auto relative z-10 flex flex-col items-center justify-center w-[70%] max-w-2xl px-6">
        {/* ── Title ── */}
        <motion.h1
          className="animate-glitch-shake font-rubik-glitch text-red-600 text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-center leading-tight"
          style={{
            textShadow:
              "0 0 10px rgba(220, 38, 38, 0.7), 0 0 40px rgba(220, 38, 38, 0.4), 0 0 80px rgba(220, 38, 38, 0.2)",
          }}
          {...entrance(0)}
        >
          prepare for the end
        </motion.h1>

        {/* ── Subtitle (above cat) ── */}
        <motion.p
          className="animate-glitch-shake mt-6 sm:mt-8 font-rubik-glitch text-gray-400 text-base sm:text-lg md:text-xl text-center tracking-wide"
          style={{
            textShadow:
              "0 0 6px rgba(156, 163, 175, 0.5), 0 0 20px rgba(156, 163, 175, 0.2)",
            animationDelay: "0.15s",
          }}
          {...entrance(0.25)}
        >
          will your life flash before your eyes?
        </motion.p>

        {/* ── Countdown Timer ── */}
        <motion.div
          className="mt-8 sm:mt-10 flex flex-col items-center"
          {...entrance(0.35)}
        >
          {secondsLeft > 0 ? (
            <motion.span
              key={secondsLeft}
              className="font-rubik-glitch text-red-500 text-6xl sm:text-7xl md:text-8xl tabular-nums"
              style={{
                textShadow:
                  "0 0 12px rgba(220, 38, 38, 0.8), 0 0 40px rgba(220, 38, 38, 0.5), 0 0 80px rgba(220, 38, 38, 0.3)",
              }}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {secondsLeft}
            </motion.span>
          ) : (
            <motion.span
              className="font-rubik-glitch text-red-600 text-3xl sm:text-4xl md:text-5xl"
              style={{
                textShadow:
                  "0 0 12px rgba(220, 38, 38, 0.8), 0 0 40px rgba(220, 38, 38, 0.5)",
              }}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {punishmentDone ? (punishmentError ? "Error" : "Executed") : "Executing..."}
            </motion.span>
          )}

          {punishmentError && punishmentDone ? (
            <motion.p
              className="text-red-400 text-sm mt-3 text-center max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {punishmentError}
            </motion.p>
          ) : null}
        </motion.div>

        {/* ── Demonic cat with glow ── */}
        <motion.div className="relative mt-10 sm:mt-14" {...entrance(0.5)}>
          {/* Pulsing red glow behind the cat */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(220,38,38,0.45) 0%, transparent 70%)",
              filter: "blur(32px)",
              transform: "scale(1.5)",
            }}
            animate={glowPulse}
            transition={glowTransition}
          />

          {/* Cat image — floats */}
          <motion.img
            src="/demonic-cat.svg"
            alt="Demonic cat"
            draggable={false}
            className="relative w-48 sm:w-56 md:w-64 drop-shadow-[0_0_24px_rgba(220,38,38,0.6)]"
            animate={floatAnimation}
            transition={floatTransition}
          />
        </motion.div>
      </div>
    </div>
  );
}
