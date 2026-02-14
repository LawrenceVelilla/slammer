import { motion } from "framer-motion";
import BackgroundParticles from "./ui/BackgroundParticles";
import PrimaryButton from "./ui/PrimaryButton";

/* ── Floating idle animation shared by all cats ── */
function floatTransition(duration, delay = 0) {
  return {
    y: {
      duration,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
      delay,
    },
  };
}

/* ── Cat wrapper with entrance + idle float ── */
function FloatingCat({
  src,
  alt,
  className,
  rotate = 0,
  entranceDelay = 0,
  floatRange = 12,
  floatDuration = 3,
  floatDelay = 0,
  style,
}) {
  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      style={{ rotate: `${rotate}deg`, ...style }}
      /* entrance spring */
      initial={{ opacity: 0, scale: 0, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: [0, -floatRange, 0] }}
      transition={{
        opacity: { delay: entranceDelay, duration: 0.5 },
        scale: {
          delay: entranceDelay,
          type: "spring",
          stiffness: 260,
          damping: 20,
        },
        ...floatTransition(floatDuration, entranceDelay + 0.4 + floatDelay),
      }}
    />
  );
}

export default function SlammerLanding() {
  return (
    <div className="relative min-h-screen w-full bg-charcoal overflow-hidden flex items-center justify-center select-none">
      {/* ── Background particles (z-0) ── */}
      <BackgroundParticles />

      {/* ── Foreground content (z-10) ── */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-4">
        {/* ── Cats + text cluster ── */}
        <div className="relative flex flex-col items-center">
          {/* ── Devious Cat — Left ── */}
          <FloatingCat
            src="/devious-cat.svg"
            alt="Devious cat"
            className="absolute w-44 sm:w-52 md:w-64 -left-44 sm:-left-56 md:-left-72 top-1/2 -translate-y-[65%]"
            rotate={-15}
            entranceDelay={0.7}
            floatRange={10}
            floatDuration={3.2}
            floatDelay={0}
          />

          {/* ── Smirking Cat — Right ── */}
          <FloatingCat
            src="/smirking-cat.svg"
            alt="Smirking cat"
            className="absolute w-44 sm:w-52 md:w-64 -right-44 sm:-right-56 md:-right-72 top-1/2 -translate-y-[65%]"
            rotate={15}
            entranceDelay={0.85}
            floatRange={10}
            floatDuration={2.8}
            floatDelay={0.3}
          />

          {/* ── Title ── */}
          <motion.h1
            className="text-white text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Slammer
          </motion.h1>

          {/* ── Subtitle ── */}
          <motion.p
            className="text-white/80 text-base sm:text-lg mt-3 tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.25,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            don&rsquo;t fuck up.
          </motion.p>

          {/* ── Button ── */}
          <div className="mt-8">
            <PrimaryButton delay={0.45}>Commence</PrimaryButton>
          </div>

          {/* ── Happy Cat — Bottom Center ── */}
          <FloatingCat
            src="/happy-cat.svg"
            alt="Happy cat"
            className="w-40 sm:w-48 md:w-56 translate-y-[55%]"
            rotate={0}
            entranceDelay={1}
            floatRange={8}
            floatDuration={3.5}
            floatDelay={0.15}
          />
        </div>
      </div>
    </div>
  );
}
