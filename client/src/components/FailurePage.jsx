import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BackgroundParticles from "./ui/BackgroundParticles";
import PrimaryButton from "./ui/PrimaryButton";

/* ── Stagger variants ── */
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

/* ── Sad-cat droop animation ── */
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

/* ── Component ── */
export default function FailurePage({ strikesRemaining = 2 }) {
  const navigate = useNavigate();

  /* If the player has zero strikes left, redirect to the nuke route */
  useEffect(() => {
    if (strikesRemaining <= 0) {
      navigate("/nuke", { replace: true });
    }
  }, [strikesRemaining, navigate]);

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
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center w-full px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Title ── */}
        <motion.h1
          className="text-white text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-center"
          variants={itemVariants}
        >
          Ouch. You messed up
        </motion.h1>

        {/* ── Sad Cat ── */}
        <motion.div className="mt-10 sm:mt-14" variants={sadCatVariants}>
          <motion.img
            src="/sad-cat.svg"
            alt="Sad cat"
            draggable={false}
            className="w-48 sm:w-56 md:w-64"
            animate={droopLoop}
            transition={droopTransition}
          />
        </motion.div>

        {/* ── Strikes remaining ── */}
        <motion.p
          className="text-white text-xl sm:text-2xl md:text-3xl font-semibold text-center mt-8 sm:mt-10"
          variants={itemVariants}
        >
          You have {strikesRemaining} strikes remaining
        </motion.p>

        {/* ── Buttons ── */}
        <motion.div
          className="mt-10 sm:mt-12 flex flex-col items-center gap-4"
          variants={itemVariants}
        >
          {/* Continue (reuses PrimaryButton) */}
          <PrimaryButton onClick={() => navigate("/waiting")}>
            Continue
          </PrimaryButton>

          {/* Show Feedback (outline style) */}
          <motion.button
            onClick={() => {}}
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
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
