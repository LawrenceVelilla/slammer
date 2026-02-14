import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackgroundParticles from "./ui/BackgroundParticles";
import quotes from "../data/quotes";
import { useSession } from "../context/SessionContext";

const API_BASE = "http://localhost:3000";

/* ── Animated Stopwatch SVG ──
   The hand position is computed each frame via requestAnimationFrame.
   No CSS transforms or rotation — just recalculating the line endpoint
   with sin/cos so the hand is always anchored to the face centre.     */
function AnimatedStopwatch({ size = 48, rpm = 15 }) {
  const raf = useRef(null);
  const start = useRef(null);
  const [angle, setAngle] = useState(-Math.PI / 2); // 12-o'clock

  const tick = useCallback(
    (ts) => {
      if (start.current === null) start.current = ts;
      const elapsed = (ts - start.current) / 1000; // seconds
      // rpm rotations per minute → radians per second
      const rad = ((rpm * 2 * Math.PI) / 60) * elapsed - Math.PI / 2;
      setAngle(rad);
      raf.current = requestAnimationFrame(tick);
    },
    [rpm]
  );

  useEffect(() => {
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [tick]);

  /* ── Geometry ── */
  const cx = size / 2;
  const faceCy = size * 0.56;
  const faceR = size * 0.36;
  const handLen = faceR * 0.65;
  const tickOuter = faceR * 0.88;
  const tickInner = tickOuter * 0.75;
  const crownW = size * 0.12;
  const crownH = size * 0.15;
  const crownY = faceCy - faceR - crownH - 2;

  /* Hand tip computed from current angle */
  const hx = cx + Math.cos(angle) * handLen;
  const hy = faceCy + Math.sin(angle) * handLen;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block"
    >
      {/* Crown / push-button */}
      <rect
        x={cx - crownW / 2}
        y={crownY}
        width={crownW}
        height={crownH}
        rx={crownW / 3}
        fill="#a1a1aa"
      />

      {/* Side lugs */}
      {[-45, 45].map((deg) => {
        const rad = (deg - 90) * (Math.PI / 180);
        return (
          <line
            key={deg}
            x1={cx + Math.cos(rad) * (faceR + 2)}
            y1={faceCy + Math.sin(rad) * (faceR + 2)}
            x2={cx + Math.cos(rad) * (faceR + 6)}
            y2={faceCy + Math.sin(rad) * (faceR + 6)}
            stroke="#a1a1aa"
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      })}

      {/* Outer ring */}
      <circle cx={cx} cy={faceCy} r={faceR + 2} stroke="#a1a1aa" strokeWidth={2} fill="none" />

      {/* Face */}
      <circle cx={cx} cy={faceCy} r={faceR} fill="#27272a" />

      {/* Tick marks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 - 90) * (Math.PI / 180);
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * tickInner}
            y1={faceCy + Math.sin(a) * tickInner}
            x2={cx + Math.cos(a) * tickOuter}
            y2={faceCy + Math.sin(a) * tickOuter}
            stroke="#71717a"
            strokeWidth={i % 3 === 0 ? 1.8 : 0.8}
            strokeLinecap="round"
          />
        );
      })}

      {/* Sweeping hand — just a line recomputed each frame */}
      <line
        x1={cx}
        y1={faceCy}
        x2={hx}
        y2={hy}
        stroke="#f4f4f5"
        strokeWidth={1.8}
        strokeLinecap="round"
      />

      {/* Centre dot */}
      <circle cx={cx} cy={faceCy} r={2} fill="#f4f4f5" />
    </svg>
  );
}

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
  const { deckId, setDeckId, deckCards, setDeckCards, setCurrentCard } = useSession();
  const [error, setError] = useState("");
  const [voiceLineFinished, setVoiceLineFinished] = useState(false);
  const [cardReady, setCardReady] = useState(false);

  // Pick a random quote once on mount
  const quoteIndex = useMemo(() => Math.floor(Math.random() * quotes.length), []);
  const quote = quotes[quoteIndex];

  // Play the matching voiceline on mount
  useEffect(() => {
    setVoiceLineFinished(false);
    const audio = new Audio(
      `http://localhost:3000/voicelines/quote-${String(quoteIndex).padStart(2, "0")}.mp3`
    );
    const onEnded = () => setVoiceLineFinished(true);
    audio.addEventListener("ended", onEnded);
    audio.play().catch(() => {
      setVoiceLineFinished(true);
    });
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [quoteIndex]);

  useEffect(() => {
    if (deckId) return;
    const storedDeckId = localStorage.getItem("slammer-deck-id") || "";
    if (storedDeckId) setDeckId(storedDeckId);
  }, [deckId, setDeckId]);

  useEffect(() => {
    let cancelled = false;
    setCardReady(false);

    async function selectNextCard() {
      const activeDeckId = deckId || localStorage.getItem("slammer-deck-id") || "";
      if (!activeDeckId) {
        setError("No deck selected. Upload cards first.");
        return;
      }

      try {
        let cards = deckCards;
        if (!cards.length) {
          const response = await fetch(`${API_BASE}/decks/${activeDeckId}/cards?limit=200&page=1`);
          if (!response.ok) throw new Error("Failed to fetch deck cards");
          const payload = await response.json();
          cards = payload.cards || [];
          if (!cancelled) setDeckCards(cards);
        }

        if (!cards.length) {
          setError("No cards found in selected deck.");
          return;
        }

        const selected = cards[Math.floor(Math.random() * cards.length)];
        if (!cancelled) {
          setCurrentCard(selected);
          setCardReady(true);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      }
    }

    selectNextCard();

    return () => {
      cancelled = true;
    };
  }, [deckCards, deckId, setCurrentCard, setDeckCards]);

  useEffect(() => {
    if (voiceLineFinished && cardReady) {
      navigate("/question");
    }
  }, [cardReady, navigate, voiceLineFinished]);

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
            &ldquo;{quote.text}&rdquo;
          </p>
          <footer className="text-white/50 text-base mt-1">
            &ndash; {quote.author}
          </footer>
        </motion.blockquote>

        {error ? <p className="mt-5 text-red-400 text-sm">{error}</p> : null}

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
