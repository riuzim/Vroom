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
import { cars } from '@/data/cars';
import { loadLocalScores, saveLocalScores, SCORES_CHANGED_EVENT } from '@/lib/localScores';

/**
 * Loop de jogo local (Fase 1). Na Fase 3 a validação dos chutes e o estado da
 * rodada migram para o servidor (server-authoritative) — este hook passa a ser
 * um cliente da API.
 */
export function useVroomGame(mode = 'classic') {
  const [currentCar, setCurrentCar] = useState(() => pickRandomCar(cars));
  const [score, setScore] = useState(0);
  const [scores, setScores] = useState(loadLocalScores);
  const [blur, setBlur] = useState(INITIAL_BLUR);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [revealedLetters, setRevealedLetters] = useState([]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [isRevealed, setIsRevealed] = useState(false);

  const isHardMode = mode === 'hard';
  const isRoundOver = status === 'correct' || status === 'failed' || status === 'skipped';

  useEffect(() => {
    function onScoresChanged() {
      setScores(loadLocalScores());
    }
    window.addEventListener(SCORES_CHANGED_EVENT, onScoresChanged);
    return () => window.removeEventListener(SCORES_CHANGED_EVENT, onScoresChanged);
  }, []);

  useEffect(() => {
    saveLocalScores(scores);
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

  const nextRound = useCallback(
    (previousCar = currentCar) => {
      setCurrentCar(pickRandomCar(cars, previousCar));
      setBlur(INITIAL_BLUR);
      setAttemptsLeft(MAX_ATTEMPTS);
      setRevealedLetters([]);
      setMessage('');
      setStatus('idle');
      setIsRevealed(false);
    },
    [currentCar]
  );

  const endRound = useCallback(
    (previousCar, endMessage, endStatus) => {
      setMessage(endMessage);
      setStatus(endStatus);
      setIsRevealed(true);
      setScores((values) => [...values, score]);
      setScore(0);
      window.setTimeout(() => nextRound(previousCar), 1600);
    },
    [nextRound, score]
  );

  const submitGuess = useCallback(
    (guess) => {
      if (!guess.trim() || status === 'correct' || status === 'failed' || status === 'skipped') {
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
        setAttemptsLeft(0);
        endRound(currentCar, `Fim de rodada. Era ${currentCar.name}.`, 'failed');
        return;
      }

      setAttemptsLeft(nextAttempts);
      setMessage(
        `Errou. ${nextAttempts} tentativa${nextAttempts === 1 ? '' : 's'} restante${nextAttempts === 1 ? '' : 's'}.`
      );
    },
    [attemptsLeft, blur, currentCar, endRound, nextRound, revealedLetters, status]
  );

  const skip = useCallback(() => {
    if (status === 'correct' || status === 'failed' || status === 'skipped') {
      return;
    }
    endRound(currentCar, `Pulou. Era ${currentCar.name}.`, 'skipped');
  }, [currentCar, endRound, status]);

  return {
    attemptsLeft,
    bestScores,
    blur: isRevealed ? 0 : blur,
    currentCar,
    hint,
    isHardMode,
    isRoundOver,
    message,
    mode,
    recentScores,
    score,
    skip,
    status,
    submitGuess,
  };
}
