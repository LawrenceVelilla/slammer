import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import BackgroundParticles from "./ui/BackgroundParticles";

/* ── Sinister "breathing" scale animation for the devious cat ── */
const plottingBreath = {
  scale: [1, 1.05, 1],
  rotate: [0, -1.5, 1.5, 0],
};

const plottingTransition = {
  duration: 3,
  repeat: Infinity,
  ease: "easeInOut",
};

/* ── Tooltip rendered via portal so it escapes framer-motion layers ── */
function MamaTooltip({ anchorRef, visible }) {
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!visible || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({
      top: rect.top - 48,
      right: window.innerWidth - rect.right,
    });
  }, [visible, anchorRef]);

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          style={{ top: pos.top, right: pos.right }}
          className="
            fixed z-9999
            bg-zinc-700 text-white text-sm font-semibold
            px-4 py-2 rounded-lg
            shadow-[0_4px_20px_rgba(0,0,0,0.5)]
            whitespace-nowrap pointer-events-none
            border border-zinc-600
          "
          initial={{ opacity: 0, scale: 0.7, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          mama ain&apos;t raise no bitch
          {/* ── Tiny arrow pointing down ── */}
          <span className="absolute -bottom-1.5 right-6 w-3 h-3 bg-zinc-700 border-b border-r border-zinc-600 rotate-45" />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default function ReadyPage() {
  const [showTooltip, setShowTooltip] = useState(false);
  const redBtnRef = useRef(null);

  /* Auto-dismiss the tooltip after 2.5s */
  useEffect(() => {
    if (!showTooltip) return;
    const timer = setTimeout(() => setShowTooltip(false), 2500);
    return () => clearTimeout(timer);
  }, [showTooltip]);

  const handleScaredClick = useCallback(() => {
    setShowTooltip(true);
  }, []);

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
        {/* ── Title ── */}
        <motion.h1
          className="text-white text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Ready to be Slammed?
        </motion.h1>

        {/* ── Devious Cat ── */}
        <motion.img
          src="/devious-cat.svg"
          alt="Devious cat"
          draggable={false}
          className="w-52 sm:w-60 md:w-72 mt-12 mb-10"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 1,
            ...plottingBreath,
          }}
          transition={{
            opacity: { delay: 0.3, duration: 0.5 },
            scale: {
              delay: 0.3,
              type: "spring",
              stiffness: 260,
              damping: 20,
              ...plottingTransition,
            },
            rotate: plottingTransition,
          }}
        />

        {/* ── Buttons Stack ── */}
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          {/* ── Green Confirm Button ── */}
          <motion.button
            className="
              relative inline-flex items-center justify-center gap-2.5
              bg-green-600 hover:bg-green-700
              text-white font-bold text-lg tracking-wide uppercase
              w-full py-4 px-8
              rounded-lg cursor-pointer
              shadow-lg shadow-green-600/25
              transition-colors duration-200
              outline-none border-none
            "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.7,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{
              scale: 1.04,
              boxShadow: "0 20px 40px rgba(22, 163, 74, 0.35)",
            }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              /* placeholder — wire up navigation later */
            }}
          >
            I&apos;M READY RAHHH
            <Check size={22} strokeWidth={3} />
          </motion.button>

          {/* ── Red/Orange Cancel Button ── */}
          <motion.button
            ref={redBtnRef}
            className="
              relative inline-flex items-center justify-center gap-2.5
              bg-red-600 hover:bg-red-700
              text-white font-bold text-lg tracking-wide uppercase
              w-full py-4 px-8
              rounded-lg cursor-pointer
              shadow-lg shadow-red-600/25
              transition-colors duration-200
              outline-none border-none
            "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.9,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{
              scale: 1.04,
              boxShadow: "0 20px 40px rgba(220, 38, 38, 0.35)",
            }}
            whileTap={{ scale: 0.96 }}
            onClick={handleScaredClick}
          >
            MOM I&apos;M SCARED
            <X size={22} strokeWidth={3} />
          </motion.button>
        </div>
      </div>

      {/* ── "Mama" Tooltip (portal to body) ── */}
      <MamaTooltip anchorRef={redBtnRef} visible={showTooltip} />
    </motion.div>
  );
}
