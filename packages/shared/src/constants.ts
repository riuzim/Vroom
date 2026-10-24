export const INITIAL_BLUR = 15;
export const BLUR_STEP = 4;
export const MAX_ATTEMPTS = 5;

export const GAME_MODES = ['classic', 'hard', 'daily', 'silhouette', 'themed'] as const;
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

/** Categorias do catálogo usadas pela rotação da Série do dia (modo themed). */
export const THEMES = [
  'jdm',
  'muscle',
  'supercar',
  'sport',
  'classic',
  'bra',
  'ev',
  'lux',
] as const;
export type Theme = (typeof THEMES)[number];

/** Tema da Série do dia — determinístico (todo mundo vê a mesma série). */
export function themeOfDay(date: string): Theme {
  const days = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000);
  return THEMES[Math.abs(days) % THEMES.length];
}

/** Data (UTC) do primeiro desafio diário numerado — o Daily #1. */
export const DAILY_EPOCH = '2026-11-01';

/** Número sequencial do desafio do dia (ex.: #12) usado no share. */
export function dailyNumber(date: string): number {
  const days = Math.floor(
    (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${DAILY_EPOCH}T00:00:00Z`)) / 86400000,
  );
  return Math.max(1, days + 1);
}
