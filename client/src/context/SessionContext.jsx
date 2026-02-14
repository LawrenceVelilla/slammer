import { createContext, useContext, useMemo, useState } from "react";

const SessionContext = createContext(null);

const INITIAL_CAT_LIVES = 3;

export function SessionProvider({ children }) {
  const [catLives, setCatLives] = useState(INITIAL_CAT_LIVES);
  const [currentCard, setCurrentCard] = useState(null);
  const [deckCards, setDeckCards] = useState([]);
  const [deckId, setDeckId] = useState(() => localStorage.getItem("slammer-deck-id") || "");

  const value = useMemo(
    () => ({
      catLives,
      currentCard,
      deckCards,
      deckId,
      setCatLives,
      setCurrentCard,
      setDeckCards,
      setDeckId,
      decrementCat() {
        setCatLives((prev) => Math.max(0, prev - 1));
      },
      resetCat() {
        setCatLives(INITIAL_CAT_LIVES);
      },
    }),
    [catLives, currentCard, deckCards, deckId]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return value;
}
