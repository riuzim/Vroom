export interface Car {
  name: string;
  /** Caminho local da imagem servido pela própria API (ex.: /api/rounds/1/image). */
  imagePath: string;
}

/** Normaliza um chute: caixa baixa, sem acentos, sem hífens/pontuação, espaços simples. */
export function normalizeGuess(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Máscara do nome com letras reveladas (espaços, hífens e dígitos sempre visíveis). */
export function getHint(name: string, revealedLetters: string[]): string {
  const visible = new Set(revealedLetters.map((letter) => letter.toLowerCase()));

  return name
    .split('')
    .map((char) => {
      if (char === ' ' || char === '-' || /\d/.test(char)) {
        return char;
      }

      return visible.has(char.toLowerCase()) ? char : '_';
    })
    .join('');
}

/** Letras ainda não reveladas de um nome. */
export function getAvailableLetters(name: string, revealedLetters: string[]): string[] {
  const visible = new Set(revealedLetters.map((letter) => letter.toLowerCase()));
  const letters = name
    .split('')
    .filter((char) => /[a-z]/i.test(char) && !visible.has(char.toLowerCase()));

  return [...new Set(letters.map((letter) => letter.toLowerCase()))];
}

/** Sorteia um carro aleatório, evitando repetir o carro atual. */
export function pickRandomCar(cars: Car[], currentCar?: Car): Car {
  if (cars.length <= 1) {
    return cars[0];
  }

  const available = cars.filter((car) => car.name !== currentCar?.name);
  // Todos os nomes iguais ao atual (teórico): devolver o primeiro é a única
  // saída — o loop de sorteio não teria como terminar.
  if (available.length === 0) {
    return cars[0];
  }

  return available[Math.floor(Math.random() * available.length)];
}

/** Rótulos de marca dos modos — iguais em todos os idiomas (como na UI). */
const SHARE_MODE_LABELS: Record<string, string> = {
  classic: 'Classic',
  hard: 'Hard',
  daily: 'Daily',
  silhouette: 'Silhouette',
  themed: 'Série',
};

export interface ShareInput {
  mode: string;
  /** Status final da rodada — só se compartilha rodada encerrada. */
  status: 'correct' | 'failed' | 'skipped';
  attemptsUsed: number;
  maxAttempts: number;
  /** Número do desafio do dia (Daily/Série). Null/nulo = modo livre. */
  dailyNumber?: number | null;
  /** Streak atual de dailies — linha 🔥 só entra quando > 0. */
  streak?: number;
  /** Rótulo localizado do modo (ex.: "Series" em EN) — default: marca própria. */
  modeLabel?: string;
  url: string;
}

/**
 * Texto de compartilhamento sem spoiler (estilo share-grid do Wordle):
 * quem NÃO jogou não vê nome do carro; quem jogou decodifica na hora.
 * Zero spoilers de idioma — só marca própria, emoji e números.
 */
export function buildShareText({
  mode,
  status,
  attemptsUsed,
  maxAttempts,
  dailyNumber: day,
  streak,
  modeLabel,
  url,
}: ShareInput): string {
  const used = Math.max(0, Math.min(attemptsUsed, maxAttempts));
  const label = modeLabel ?? SHARE_MODE_LABELS[mode] ?? 'Vroom';
  const header = day ? `Vroom ${label} #${day}` : `Vroom ${label}`;

  let row: string;
  let score: string;
  if (status === 'correct') {
    row = '🟥'.repeat(Math.max(0, used - 1)) + '🟩';
    score = `${used}/${maxAttempts}`;
  } else if (status === 'skipped') {
    row = '🟥'.repeat(used) + '⬜'.repeat(maxAttempts - used);
    score = `X/${maxAttempts}`;
  } else {
    row = '🟥'.repeat(maxAttempts);
    score = `X/${maxAttempts}`;
  }

  const lines = [header, `${row} ${score}`];
  if (streak && streak > 0) {
    lines.push(`🔥 ${streak}`);
  }
  lines.push(url);
  return lines.join('\n');
}

const DAY_MS = 86_400_000;

function toDays(date: string): number {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / DAY_MS);
}

/**
 * Streak de dias consecutivos (datas ISO YYYY-MM-DD). `today` define o
 * presente: a sequência atual continua viva se o último dia jogado for
 * hoje ou ontem — quem volta depois de 1 dia de pausa não perde o streak.
 */
export function computeStreak(dates: string[], today: string): { current: number; best: number } {
  const sorted = [...new Set(dates)].sort();
  if (sorted.length === 0) {
    return { current: 0, best: 0 };
  }

  // Melhor sequência histórica: varredura única das datas ordenadas.
  let best = 0;
  let run = 0;
  let prev: number | null = null;

  for (const date of sorted) {
    const days = toDays(date);
    run = prev !== null && days - prev === 1 ? run + 1 : 1;
    prev = days;
    best = Math.max(best, run);
  }

  // Sequência atual: conta de trás pra frente a partir do último dia,
  // que precisa ser hoje ou ontem para o streak ainda estar "vivo".
  let current = 0;
  const last = toDays(sorted[sorted.length - 1]);
  const todayDays = toDays(today);

  if (last === todayDays || last === todayDays - 1) {
    current = 1;
    for (let index = sorted.length - 2; index >= 0; index -= 1) {
      if (toDays(sorted[index + 1]) - toDays(sorted[index]) === 1) {
        current += 1;
      } else {
        break;
      }
    }
  }

  return { current, best };
}
