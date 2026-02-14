import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import BackgroundParticles from "./ui/BackgroundParticles";
import { useSession } from "../context/SessionContext";

const API_BASE = "http://localhost:3000";

const plottingBreath = {
  scale: [1, 1.05, 1],
  rotate: [0, -1.5, 1.5, 0],
};

const plottingTransition = {
  duration: 3,
  repeat: Infinity,
  ease: "easeInOut",
};

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
          <span className="absolute -bottom-1.5 right-6 w-3 h-3 bg-zinc-700 border-b border-r border-zinc-600 rotate-45" />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default function ReadyPage() {
  const navigate = useNavigate();
  const { deckId, setDeckId, setDeckCards, setCurrentCard } = useSession();
  const [showTooltip, setShowTooltip] = useState(false);
  const [decks, setDecks] = useState([]);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [deletingDeck, setDeletingDeck] = useState(false);
  const [deckError, setDeckError] = useState("");
  const redBtnRef = useRef(null);

  useEffect(() => {
    if (!showTooltip) return;
    const timer = setTimeout(() => setShowTooltip(false), 2500);
    return () => clearTimeout(timer);
  }, [showTooltip]);

  const handleScaredClick = useCallback(() => {
    setShowTooltip(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDecks() {
      setLoadingDecks(true);
      setDeckError("");
      try {
        const response = await fetch(`${API_BASE}/decks?limit=200&page=1`);
        if (!response.ok) throw new Error("Failed to load decks");
        const payload = await response.json();
        const list = payload.decks || [];
        if (cancelled) return;

        setDecks(list);

        const persistedDeckId = deckId || localStorage.getItem("slammer-deck-id") || "";
        const hasPersisted = list.some((item) => item._id === persistedDeckId);
        const nextDeckId = hasPersisted ? persistedDeckId : list[0]?._id || "";

        if (nextDeckId) {
          setDeckId(nextDeckId);
          localStorage.setItem("slammer-deck-id", nextDeckId);
        }
      } catch (error) {
        if (!cancelled) setDeckError(error.message);
      } finally {
        if (!cancelled) setLoadingDecks(false);
      }
    }

    loadDecks();
    return () => {
      cancelled = true;
    };
  }, [deckId, setDeckId]);

  function handleDeckChange(event) {
    const nextDeckId = event.target.value;
    setDeckId(nextDeckId);
    setDeckCards([]);
    setCurrentCard(null);
    localStorage.setItem("slammer-deck-id", nextDeckId);
  }

  async function handleDeleteDeck() {
    if (!deckId || deletingDeck) return;
    const deletedIndex = decks.findIndex((deck) => deck._id === deckId);
    const activeDeck = decks.find((deck) => deck._id === deckId);
    const name = activeDeck?.name || "this deck";
    const ok = window.confirm(`Delete "${name}" and all its cards?`);
    if (!ok) return;

    setDeletingDeck(true);
    setDeckError("");
    try {
      const response = await fetch(`${API_BASE}/decks/${deckId}`, {
        method: "DELETE",
        headers: { "x-api-key": import.meta.env.VITE_API_KEY || "" },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Failed to delete deck");

      const remaining = decks.filter((deck) => deck._id !== deckId);
      setDecks(remaining);
      setDeckCards([]);
      setCurrentCard(null);

      const nextIndex = Math.min(deletedIndex, Math.max(remaining.length - 1, 0));
      const nextDeckId = remaining[nextIndex]?._id || "";
      setDeckId(nextDeckId);
      if (nextDeckId) {
        localStorage.setItem("slammer-deck-id", nextDeckId);
      } else {
        localStorage.removeItem("slammer-deck-id");
      }
    } catch (error) {
      setDeckError(error.message);
    } finally {
      setDeletingDeck(false);
    }
  }

  return (
    <motion.div
      className="relative min-h-screen w-full bg-charcoal overflow-hidden flex flex-col items-center justify-center select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <BackgroundParticles />

      <div className="relative z-10 flex flex-col items-center w-full max-w-xl px-6">
        <motion.h1
          className="text-white text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Ready to be Slammed?
        </motion.h1>

        <motion.img
          src="/devious-cat.svg"
          alt="Devious cat"
          draggable={false}
          className="w-52 sm:w-60 md:w-72 mt-12 mb-8"
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

        <motion.div
          className="w-full max-w-sm mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <label htmlFor="deck-select" className="block text-white/80 text-sm mb-2">
            Choose Deck
          </label>
          <select
            id="deck-select"
            className="w-full rounded-lg bg-zinc-900 text-white px-4 py-3 outline-none ring-1 ring-white/15 focus:ring-2 focus:ring-green-500"
            value={deckId}
            onChange={handleDeckChange}
            disabled={loadingDecks || decks.length === 0}
          >
            {decks.map((deck) => (
              <option key={deck._id} value={deck._id}>
                {deck.name}
              </option>
            ))}
          </select>
          {loadingDecks ? <p className="mt-2 text-xs text-white/60">Loading decks...</p> : null}
          {deckError ? <p className="mt-2 text-xs text-red-400">{deckError}</p> : null}
          {!loadingDecks && decks.length === 0 ? (
            <p className="mt-2 text-xs text-yellow-300">No decks found. Upload one first.</p>
          ) : null}
        </motion.div>

        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
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
            disabled={decks.length === 0}
            style={{ opacity: decks.length === 0 ? 0.6 : 1 }}
            onClick={() => navigate("/waiting")}
          >
            I&apos;M READY RAHHH
            <Check size={22} strokeWidth={3} />
          </motion.button>

          <motion.button
            className="
              relative inline-flex items-center justify-center gap-2.5
              bg-transparent border border-white/40 hover:bg-white/10
              text-white font-bold text-lg tracking-wide uppercase
              w-full py-4 px-8
              rounded-lg cursor-pointer
              transition-colors duration-200
              outline-none
            "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.8,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/upload")}
          >
            Upload Another Deck
          </motion.button>

          <motion.button
            className="
              relative inline-flex items-center justify-center gap-2.5
              bg-transparent border border-red-400/60 hover:bg-red-500/10
              text-red-200 font-bold text-lg tracking-wide uppercase
              w-full py-4 px-8
              rounded-lg cursor-pointer
              transition-colors duration-200
              outline-none
            "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.85,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={!deckId || deletingDeck}
            style={{ opacity: !deckId || deletingDeck ? 0.6 : 1 }}
            onClick={handleDeleteDeck}
          >
            {deletingDeck ? "Deleting Deck..." : "Delete Selected Deck"}
          </motion.button>

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

      <MamaTooltip anchorRef={redBtnRef} visible={showTooltip} />
    </motion.div>
  );
}
