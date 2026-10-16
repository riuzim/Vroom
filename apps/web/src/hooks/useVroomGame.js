import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BLUR_STEP,
  getAvailableLetters,
  getHint,
  INITIAL_BLUR,
  MAX_ATTEMPTS,
  normalizeGuess,
  pickRandomCar,
} from '@vroom/shared';
import { cars } from '../data/cars';

const SCORE_STORAGE_KEY = 'vroom:scores';

function loadScores() {
  try {
    const stored = JSON.parse(localStorage.getItem(SCORE_STORAGE_KEY));
    return Array.isArray(stored) ? stored.filter(Number.isFinite) : [];
  } catch {
    return [];
  }
}

export function useVroomGame() {
  const [currentCar, setCurrentCar] = useState(() => pickRandomCar(cars));
  const [score, setScore] = useState(0);
  const [scores, setScores] = useState(loadScores);
  const [blur, setBlur] = useState(INITIAL_BLUR);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [revealedLetters, setRevealedLetters] = useState([]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [isHardMode, setIsHardMode] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scores));
  }, [scores]);

  const bestScores = useMemo(
    () => [...scores].filter((item) => item > 0).sort((a, b) => b - a).slice(0, 3),
    [scores]
  );

  const recentScores = useMemo(
    () => [...scores].filter((item) => item > 0).slice(-5).reverse(),
    [scores]
  );

  const hint = useMemo(() => getHint(currentCar.name, revealedLetters), [currentCar, revealedLetters]);

  const nextRound = useCallback((previousCar = currentCar) => {
    setCurrentCar(pickRandomCar(cars, previousCar));
    setBlur(INITIAL_BLUR);
    setAttemptsLeft(MAX_ATTEMPTS);
    setRevealedLetters([]);
    setMessage('');
    setStatus('idle');
    setIsRevealed(false);
  }, [currentCar]);

  const submitGuess = useCallback((guess) => {
    if (!guess.trim() || status === 'correct') {
      return;
    }

    if (normalizeGuess(guess) === normalizeGuess(currentCar.name)) {
      setScore((value) => value + 1);
      setMessage(`Acertou: ${currentCar.name}`);
      setStatus('correct');
      setIsRevealed(true);
      window.setTimeout(() => nextRound(currentCar), 1200);
      return;
    }

    const nextAttempts = attemptsLeft - 1;
    const nextBlur = Math.max(0, blur - BLUR_STEP);
    const availableLetters = getAvailableLetters(currentCar.name, revealedLetters);
    const letter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
    const nextLetters = letter ? [...revealedLetters, letter] : revealedLetters;

    setBlur(nextBlur);
    setRevealedLetters(nextLetters);
    setStatus('wrong');

    if (nextAttempts <= 0) {
      setMessage(`Fim de rodada. Era ${currentCar.name}.`);
      setAttemptsLeft(0);
      setIsRevealed(true);
      setScores((values) => [...values, score]);
      setScore(0);
      window.setTimeout(() => nextRound(currentCar), 1600);
      return;
    }

    setAttemptsLeft(nextAttempts);
    setMessage(`Errou. ${nextAttempts} tentativa${nextAttempts === 1 ? '' : 's'} restante${nextAttempts === 1 ? '' : 's'}.`);
  }, [attemptsLeft, blur, currentCar, nextRound, revealedLetters, score, status]);

  function resetScores() {
    setScores([]);
  }

  return {
    attemptsLeft,
    bestScores,
    blur: isRevealed ? 0 : blur,
    currentCar,
    hint,
    isHardMode,
    message,
    recentScores,
    resetScores,
    score,
    status,
    submitGuess,
    toggleHardMode: () => setIsHardMode((value) => !value),
  };
}
