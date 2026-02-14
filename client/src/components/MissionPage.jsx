import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BackgroundParticles from "./ui/BackgroundParticles";
import PrimaryButton from "./ui/PrimaryButton";

const missionSteps = [
  "Upload Anki Flashcards in txt form",
  "A random flashcard/quest will pop up every couple of minutes",
  "You must complete what is required",
  "If the task is not successfully completed in the given time limit, then a punishment will be administered",
];

/* ── Stagger orchestration ── */
const listContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.4,
    },
  },
};

const listItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function MissionPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full bg-charcoal overflow-hidden flex flex-col items-center justify-center select-none">
      {/* ── Background particles (z-0) ── */}
      <BackgroundParticles />

      {/* ── Foreground content (z-10) ── */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-6">
        {/* ── Title ── */}
        <motion.h1
          className="text-white text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Your Mission
        </motion.h1>

        {/* ── Numbered list ── */}
        <motion.ol
          className="mt-10 space-y-4 text-white/90 text-base sm:text-lg list-decimal list-inside leading-relaxed"
          variants={listContainer}
          initial="hidden"
          animate="visible"
        >
          {missionSteps.map((step, i) => (
            <motion.li key={i} variants={listItem} className="pl-1">
              {step}
            </motion.li>
          ))}
        </motion.ol>

        {/* ── Button ── */}
        <div className="mt-10">
          <PrimaryButton
            delay={1.2}
            onClick={() => navigate("/study")}
          >
            Understood
          </PrimaryButton>
        </div>

        {/* ── Shocked Cat — Bottom ── */}
        <motion.img
          src="/shocked-cat.svg"
          alt="Shocked cat"
          draggable={false}
          className="w-44 sm:w-52 md:w-60 mt-10"
          initial={{ y: 160, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 1.6,
            type: "spring",
            stiffness: 180,
            damping: 18,
          }}
        />
      </div>
    </div>
  );
}
