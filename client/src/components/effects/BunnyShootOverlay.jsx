import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Full-screen overlay: shooter-bunny slides in from left,
 * fires at alive-bunny (centre), white flash + screen shake,
 * alive-bunny swaps to dead-buny.svg, then overlay fades out.
 *
 * Props:
 *   visible  – boolean, mount/unmount trigger
 *   onDone   – called when the full animation finishes
 */
export default function BunnyShootOverlay({ visible, onDone }) {
  const [phase, setPhase] = useState("idle"); // idle → enter → flash → dead → exit
  const audioRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      setPhase("idle");
      return;
    }

    setPhase("enter");

    // Timeline: enter(600ms) → flash+bang(200ms) → dead(1200ms) → exit
    const t1 = setTimeout(() => {
      // Play loud bang
      try {
        audioRef.current = new Audio(
          "http://localhost:3000/Loud_Bang-Osama_Bin_Laden-925764326.mp3"
        );
        audioRef.current.volume = 1;
        audioRef.current.play().catch(() => {});
      } catch {}
      setPhase("flash");
    }, 600);

    const t2 = setTimeout(() => setPhase("dead"), 800);
    const t3 = setTimeout(() => setPhase("exit"), 2000);
    const t4 = setTimeout(() => {
      setPhase("idle");
      onDone?.();
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [visible, onDone]);

  if (phase === "idle") return null;

  return (
    <AnimatePresence>
      {phase !== "idle" && (
        <motion.div
          key="bunny-overlay"
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            // Screen shake during flash + dead phases
            x:
              phase === "flash"
                ? [0, -12, 14, -10, 8, -6, 4, 0]
                : 0,
            y:
              phase === "flash"
                ? [0, 8, -10, 6, -8, 4, -2, 0]
                : 0,
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.3 },
            x: { duration: 0.4, ease: "easeOut" },
            y: { duration: 0.4, ease: "easeOut" },
          }}
        >
          {/* White flash */}
          <AnimatePresence>
            {phase === "flash" && (
              <motion.div
                key="flash"
                className="absolute inset-0 bg-white z-[10001]"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              />
            )}
          </AnimatePresence>

          {/* Shooter bunny — slides in from left */}
          <motion.img
            src="/shooter-bunny.svg"
            alt="Shooter bunny"
            draggable={false}
            className="absolute w-56 sm:w-64 md:w-72 z-[10000]"
            style={{ right: "5%", bottom: "15%" }}
            initial={{ x: "120%", opacity: 0 }}
            animate={{
              x: phase === "exit" ? "120%" : "0%",
              opacity: phase === "exit" ? 0 : 1,
            }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          />

          {/* Victim bunny — alive then dead */}
          <motion.img
            src={
              phase === "dead" || phase === "exit"
                ? "/dead-buny.svg"
                : "/alive-bunny.svg"
            }
            alt="Victim bunny"
            draggable={false}
            className="z-[10000]"
            style={{ width: "clamp(180px, 30vw, 320px)" }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: phase === "flash" ? 1.15 : 1,
              rotate: phase === "dead" || phase === "exit" ? -8 : 0,
              y: phase === "dead" || phase === "exit" ? 30 : 0,
            }}
            transition={{
              scale: { duration: 0.15 },
              rotate: { duration: 0.3 },
              y: { duration: 0.3 },
              opacity: { duration: 0.3 },
            }}
          />

          {/* "STRIKE 1" text */}
          <motion.p
            className="absolute bottom-[8%] text-red-500 font-black text-4xl sm:text-5xl md:text-6xl tracking-widest uppercase z-[10000]"
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: phase === "dead" || phase === "exit" ? 1 : 0,
              y: phase === "dead" || phase === "exit" ? 0 : 30,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            Strike 1
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
