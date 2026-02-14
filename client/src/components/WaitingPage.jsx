import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackgroundParticles from "./ui/BackgroundParticles";
import AnimatedStopwatch from "./ui/AnimatedStopwatch";

/* ── Animated Ellipsis Hook ── */
function useAnimatedEllipsis(intervalMs = 600) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return dots;
}

/* ── Bouncing Cat Animation ── */
const bounceCat = {
  x: [0, -18, 0, 18, 0],
  y: [0, -12, 0, -12, 0],
  rotate: [0, -6, 0, 6, 0],
};

const bounceTransition = {
  duration: 2,
  repeat: Infinity,
  ease: "easeInOut",
};

export default function WaitingPage() {
  const dots = useAnimatedEllipsis(600);
  const navigate = useNavigate();

  return (
    <motion.div
      className="relative min-h-screen w-full bg-charcoal overflow-hidden flex flex-col items-center justify-center select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* ── Background particles (z-0) ── */}
      <BackgroundParticles />

      {/* ── Foreground content (z-10) ── */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-xl px-6">
        {/* ── Title with stopwatch ── */}
        <motion.h1
          className="text-white text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Your Demise Awaits You
          {/* Fixed-width dots so title doesn't reflow */}
          <span className="inline-block w-[1.2em] text-left">{dots}</span>
          {" "}
          <span className="inline-block align-middle translate-y-[-0.05em]">
            <AnimatedStopwatch size={48} />
          </span>
        </motion.h1>

        {/* ── Quote Section ── */}
        <motion.blockquote
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.35,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <p className="text-white/70 text-lg sm:text-xl italic leading-relaxed">
            &ldquo;Random ass quote here&rdquo;
          </p>
          <footer className="text-white/50 text-base mt-1">
            &ndash; Albert Einstein
          </footer>
        </motion.blockquote>

        {/* ── Silly Cat (bouncing) ── */}
        <motion.img
          src="/silly-cat.svg"
          alt="Silly cat"
          draggable={false}
          className="w-48 sm:w-56 md:w-64 mt-12"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            ...bounceCat,
          }}
          transition={{
            opacity: { delay: 0.5, duration: 0.5 },
            scale: {
              delay: 0.5,
              type: "spring",
              stiffness: 260,
              damping: 20,
            },
            x: bounceTransition,
            y: bounceTransition,
            rotate: bounceTransition,
          }}
        />
      </div>
    </motion.div>
  );
}
