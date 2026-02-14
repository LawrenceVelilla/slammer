import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import BackgroundParticles from "./ui/BackgroundParticles";
import PrimaryButton from "./ui/PrimaryButton";
import { useSession } from "../context/SessionContext";
import BunnyShootOverlay from "./effects/BunnyShootOverlay";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const sadCatVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const droopLoop = {
  rotate: [0, -4, 0, 4, 0],
  y: [0, 4, 0, 4, 0],
};

const droopTransition = {
  rotate: {
    duration: 3.5,
    repeat: Infinity,
    ease: "easeInOut",
  },
  y: {
    duration: 3.5,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export default function FailurePage() {
  const sessionStrikesRemaining = useSession().catLives;
  const navigate = useNavigate();
  const location = useLocation();
  const [showFeedback, setShowFeedback] = useState(false);
  const [showBunnyPunishment, setShowBunnyPunishment] = useState(false);
  const [punishmentResolved, setPunishmentResolved] = useState(false);
  const [punishmentError, setPunishmentError] = useState("");
  const effectStartedRef = useRef(false);

  const feedback = location.state?.feedback || "No feedback returned.";
  const score = location.state?.score;
  const strikesRemaining = Number(location.state?.strikesRemaining ?? sessionStrikesRemaining);
  const strikeNumber = useMemo(
    () => Math.max(0, 3 - Math.max(0, Number(strikesRemaining || 0))),
    [strikesRemaining]
  );
  const runId = useMemo(
    () => `failure-punishment:${location.key}:${strikeNumber}`,
    [location.key, strikeNumber]
  );

  useEffect(() => {
    if (effectStartedRef.current) return;
    effectStartedRef.current = true;
    setPunishmentResolved(false);
    setPunishmentError("");

    if (sessionStorage.getItem(runId) === "done") {
      setPunishmentResolved(true);
      return;
    }

    if (strikeNumber <= 0) {
      sessionStorage.setItem(runId, "done");
      setPunishmentResolved(true);
      return;
    }

    if (strikeNumber === 1) {
      setShowBunnyPunishment(true);
      return;
    }

    async function runDesktopPunishment() {
      try {
        if (window.slammer?.executePunishment) {
          await window.slammer.executePunishment(strikeNumber, "hard");
        }
      } catch (error) {
        setPunishmentError(error?.message || "Punishment execution failed.");
      } finally {
        sessionStorage.setItem(runId, "done");
        setPunishmentResolved(true);
      }
    }

    runDesktopPunishment();
  }, [runId, strikeNumber]);

  function handleBunnyDone() {
    setShowBunnyPunishment(false);
    sessionStorage.setItem(runId, "done");
    setPunishmentResolved(true);
  }

  return (
    <motion.div
      className="relative min-h-screen w-full bg-charcoal overflow-hidden flex flex-col items-center justify-center select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <BackgroundParticles />
      <BunnyShootOverlay visible={showBunnyPunishment} onDone={handleBunnyDone} />

      <motion.div
        className="relative z-10 flex flex-col items-center justify-center w-full px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-white text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-center"
          variants={itemVariants}
        >
          Ouch. You messed up
        </motion.h1>

        <motion.div className="mt-10 sm:mt-14" variants={sadCatVariants}>
          <motion.img
            src={strikesRemaining == 2 ? "/dead-buny.svg" : "/sad-cat.svg" }
            alt={strikesRemaining == 2 ? "Dead bunny" : "Sad cat"}
            draggable={false}
            className="w-48 sm:w-56 md:w-64"
            animate={droopLoop}
            transition={droopTransition}
          />
        </motion.div>

        <motion.p
          className="text-white text-xl sm:text-2xl md:text-3xl font-semibold text-center mt-8 sm:mt-10"
          variants={itemVariants}
        >
          You have {strikesRemaining} {strikesRemaining == 1 ? "strike" : "strikes"} remaining
        </motion.p>

        {!punishmentResolved ? (
          <motion.p className="text-white/70 text-sm mt-4 text-center" variants={itemVariants}>
            Executing punishment...
          </motion.p>
        ) : null}

        {punishmentError ? (
          <motion.p className="text-red-400 text-sm mt-3 text-center" variants={itemVariants}>
            {punishmentError}
          </motion.p>
        ) : null}

        <motion.div className="mt-10 sm:mt-12 flex flex-col items-center gap-4" variants={itemVariants}>
          {punishmentResolved ? (
            <PrimaryButton onClick={() => navigate("/waiting")}>Continue</PrimaryButton>
          ) : null}

          <motion.button
            onClick={() => setShowFeedback((prev) => !prev)}
            className="
              inline-flex items-center justify-center
              bg-transparent border border-white
              text-white font-semibold
              text-xl px-10 py-3
              rounded-lg cursor-pointer
              transition-colors duration-200
              outline-none
              hover:bg-white/10
            "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Show Feedback
          </motion.button>

          {showFeedback ? (
            <motion.div
              className="max-w-2xl rounded-lg border border-white/20 bg-white/5 px-5 py-4 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {typeof score === "number" ? <p className="text-white/70 text-sm">Score: {score}/10</p> : null}
              <p className="text-white/90 text-sm mt-1">{feedback}</p>
            </motion.div>
          ) : null}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
