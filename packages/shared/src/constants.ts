export const INITIAL_BLUR = 15;
export const BLUR_STEP = 4;
export const MAX_ATTEMPTS = 5;

export const GAME_MODES = ['classic', 'hard', 'daily'] as const;
export type GameMode = (typeof GAME_MODES)[number];

export const ROUND_STATUSES = ['playing', 'correct', 'failed', 'skipped'] as const;
export type RoundStatus = (typeof ROUND_STATUSES)[number];

export const POINTS_PER_ATTEMPT = 10;
export const HARD_MODE_MULTIPLIER = 2;

/** Pontos de uma rodada encerrada: 10 x tentativas restantes (x2 no Hard). */
export function calculatePoints(attemptsLeft: number, mode: GameMode): number {
  const base = Math.max(0, attemptsLeft) * POINTS_PER_ATTEMPT;
  return mode === 'hard' ? base * HARD_MODE_MULTIPLIER : base;
}

/** Nível de blur (px) de uma rodada a partir do número de erros. */
export function blurFromMistakes(mistakes: number): number {
  return Math.max(0, INITIAL_BLUR - mistakes * BLUR_STEP);
}
