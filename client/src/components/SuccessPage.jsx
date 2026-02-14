import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import BackgroundParticles from "./ui/BackgroundParticles";
import PrimaryButton from "./ui/PrimaryButton";

/* ── Confetti helpers ── */
function fireConfetti() {
  const duration = 2500;
  const end = Date.now() + duration;

  const left = { angle: 60, origin: { x: 0, y: 0.6 } };
  const right = { angle: 120, origin: { x: 1, y: 0.6 } };

  const shared = {
    particleCount: 4,
    spread: 80,
    startVelocity: 55,
    ticks: 200,
    gravity: 0.8,
    colors: ["#22c55e", "#facc15", "#f97316", "#ef4444", "#3b82f6", "#a855f7"],
    scalar: 1.1,
  };

  (function frame() {
    if (Date.now() > end) return;
    confetti({ ...shared, ...left });
    confetti({ ...shared, ...right });
    requestAnimationFrame(frame);
  })();
}

/* ── Component ── */
export default function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const feedback = location.state?.feedback || "";
  const score = location.state?.score;

  /* fire confetti once on mount */
  useEffect(() => {
    fireConfetti();
  }, []);

  return (
    <motion.div
      className="relative min-h-screen w-full bg-charcoal overflow-hidden flex flex-col items-center justify-center select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* ── Background particles (z-0) ── */}
      <BackgroundParticles />

      {/* ── Foreground content (z-10) ── */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-6">
        {/* ── Title ── */}
        <motion.h1
          className="text-white text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Congratulations!
        </motion.h1>

        {/* ── Subtitle ── */}
        <motion.p
          className="text-white text-xl sm:text-2xl md:text-3xl font-medium text-center mt-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          You live to see another day
        </motion.p>

        {feedback ? (
          <motion.div
            className="mt-6 max-w-2xl rounded-lg border border-white/20 bg-white/5 px-5 py-4 text-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {typeof score === "number" ? <p className="text-white/70 text-sm">Score: {score}/10</p> : null}
            <p className="text-white/90 text-sm mt-1">{feedback}</p>
          </motion.div>
        ) : null}

        {/* ── Animated Happy Cat ──
             Outer div = entrance (scale spring, once).
             Inner img = looping cycle: bounce L → R → cartwheel 360.
             Keeping them separate avoids the spring fighting the loop. */}
        <motion.div
          className="mt-10 sm:mt-14"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            opacity: { delay: 0.3, duration: 0.4 },
            scale: {
              delay: 0.3,
              type: "spring",
              stiffness: 260,
              damping: 20,
            },
          }}
        >
          <motion.img
            src="/happy-cat.svg"
            alt="Happy cat doing cartwheels"
            draggable={false}
            className="w-48 sm:w-56 md:w-64"
            animate={{
              /*        rest → left  → center → right → center → rise  → spin-peak → land   */
              x:      [ 0,    -50,     0,        50,     0,       0,      0,          0     ],
              y:      [ 0,    -14,     0,       -14,     0,      -32,    -32,          0     ],
              rotate: [ 0,    -12,     0,        12,     0,        0,    180,        360     ],
            }}
            transition={{
              x: {
                delay: 0.8,
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.14, 0.28, 0.42, 0.56, 0.68, 0.84, 1],
              },
              y: {
                delay: 0.8,
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.14, 0.28, 0.42, 0.56, 0.68, 0.84, 1],
              },
              rotate: {
                delay: 0.8,
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.14, 0.28, 0.42, 0.56, 0.68, 0.84, 1],
              },
            }}
          />
        </motion.div>

        {/* ── Continue Button ── */}
        <div className="mt-12 sm:mt-16">
          <PrimaryButton delay={0.6} onClick={() => navigate("/waiting")}>
            Continue
          </PrimaryButton>
        </div>
      </div>
    </motion.div>
  );
}
