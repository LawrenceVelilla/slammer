import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronDown, AlertTriangle, Skull } from "lucide-react";
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

/* ── Mode config ── */
const MODES = {
  hard: {
    label: "Hard",
    description: "Strike 3 shuts down your PC.",
    color: "text-orange-400",
    bgHover: "hover:bg-orange-500/10",
  },
  extreme: {
    label: "Extreme",
    description: "Strike 3 deletes your root folder. Irreversible.",
    color: "text-red-500",
    bgHover: "hover:bg-red-500/10",
  },
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

/* ── Extreme mode confirmation modal ── */
function ExtremeWarningModal({ onConfirm, onCancel }) {
  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="bg-zinc-900 border-2 border-red-600 rounded-2xl p-8 max-w-md mx-4 shadow-[0_0_60px_rgba(220,38,38,0.3)]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Skull + warning icon */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <Skull className="text-red-500" size={32} />
            <AlertTriangle className="text-yellow-400" size={32} />
            <Skull className="text-red-500" size={32} />
          </div>

          <h2 className="text-red-500 text-2xl font-black text-center uppercase tracking-wider mb-4">
            Are you absolutely sure?
          </h2>

          <div className="space-y-3 text-sm leading-relaxed">
            <p className="text-white/90 text-center">
              Extreme mode will <span className="text-red-400 font-bold">permanently delete your entire root folder</span> on Strike 3. This is <span className="text-red-400 font-bold underline">not reversible</span>.
            </p>

            <div className="bg-red-950/50 border border-red-800 rounded-lg p-3 space-y-2">
              <p className="text-red-300 font-semibold flex items-center gap-2">
                <AlertTriangle size={16} /> This means:
              </p>
              <ul className="text-red-200/80 text-xs space-y-1 ml-6 list-disc">
                <li>Your operating system will be destroyed</li>
                <li>All files, programs, and data will be erased</li>
                <li>Your computer will become unusable</li>
                <li>There is no undo, no recovery, no going back</li>
              </ul>
            </div>

            <p className="text-yellow-400/90 text-center text-xs font-semibold">
              Only enable this if you are running in a virtual machine or truly do not care about this device.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-sm uppercase tracking-wide transition-colors cursor-pointer"
            >
              No, go back
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-4 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold text-sm uppercase tracking-wide transition-colors cursor-pointer border border-red-500"
            >
              I understand, enable it
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

/* ── Difficulty dropdown ── */
function DifficultySelector({ mode, setMode, setShowExtremeWarning }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const currentMode = MODES[mode];

  const handleSelect = (key) => {
    if (key === "extreme" && mode !== "extreme") {
      setShowExtremeWarning(true);
    } else {
      setMode(key);
      localStorage.setItem("slammer-mode", key);
    }
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative w-full max-w-xs">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`
          w-full flex items-center justify-between gap-2
          px-4 py-3 rounded-lg
          bg-zinc-800/80 border border-zinc-600
          hover:border-zinc-500
          text-left cursor-pointer
          transition-colors duration-150
        `}
      >
        <div>
          <span className="text-white/50 text-xs uppercase tracking-wider block mb-0.5">
            Difficulty
          </span>
          <span className={`font-bold text-sm ${currentMode.color}`}>
            {currentMode.label}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-600 rounded-lg overflow-hidden shadow-xl z-50"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {Object.entries(MODES).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className={`
                  w-full text-left px-4 py-3
                  ${cfg.bgHover}
                  ${mode === key ? "bg-zinc-700/50" : ""}
                  transition-colors duration-100 cursor-pointer
                  border-b border-zinc-700 last:border-b-0
                `}
              >
                <span className={`font-bold text-sm block ${cfg.color}`}>
                  {key === "extreme" && <Skull size={14} className="inline mr-1.5 -mt-0.5" />}
                  {cfg.label}
                </span>
                <span className="text-white/40 text-xs">{cfg.description}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ReadyPage() {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);
  const [showExtremeWarning, setShowExtremeWarning] = useState(false);
  const [mode, setMode] = useState(
    () => localStorage.getItem("slammer-mode") || "hard"
  );
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

  const handleConfirmExtreme = useCallback(() => {
    setMode("extreme");
    localStorage.setItem("slammer-mode", "extreme");
    setShowExtremeWarning(false);
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
          className="w-52 sm:w-60 md:w-72 mt-12 mb-6"
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

        {/* ── Difficulty Selector ── */}
        <motion.div
          className="w-full flex justify-center mb-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <DifficultySelector
            mode={mode}
            setMode={setMode}
            setShowExtremeWarning={setShowExtremeWarning}
          />
        </motion.div>

        {/* ── Extreme mode active warning banner ── */}
        <AnimatePresence>
          {mode === "extreme" && (
            <motion.div
              className="w-full max-w-sm mb-4 px-4 py-2.5 rounded-lg bg-red-950/60 border border-red-800/60 flex items-center gap-2"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertTriangle size={16} className="text-red-400 shrink-0" />
              <p className="text-red-300 text-xs font-semibold">
                Extreme mode active &mdash; Strike 3 will delete your root folder.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

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
            onClick={() => navigate("/waiting")}
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

      {/* ── Extreme mode confirmation modal ── */}
      {showExtremeWarning && (
        <ExtremeWarningModal
          onConfirm={handleConfirmExtreme}
          onCancel={() => setShowExtremeWarning(false)}
        />
      )}
    </motion.div>
  );
}
