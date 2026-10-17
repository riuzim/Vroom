import { useSyncExternalStore } from 'react';

const SCORE_STORAGE_KEY = 'vroom:scores';
export const SCORES_CHANGED_EVENT = 'vroom:scores-changed';

let cache = { raw: null, scores: [] };

/** Lê os scores locais com cache estável (seguro para useSyncExternalStore). */
export function loadLocalScores() {
  let raw;
  try {
    raw = localStorage.getItem(SCORE_STORAGE_KEY);
  } catch {
    // Storage bloqueado (modo privado, etc.): mantém o que já está em cache.
    return cache.scores;
  }

  if (raw !== cache.raw) {
    try {
      const stored = JSON.parse(raw);
      cache = { raw, scores: Array.isArray(stored) ? stored.filter(Number.isFinite) : [] };
    } catch {
      cache = { raw, scores: [] };
    }
  }

  return cache.scores;
}

export function saveLocalScores(scores) {
  try {
    localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scores));
  } catch {
    // Cota cheia ou storage bloqueado: a partida continua, só não persiste.
  }
  window.dispatchEvent(new CustomEvent(SCORES_CHANGED_EVENT));
}

export function clearLocalScores() {
  try {
    localStorage.removeItem(SCORE_STORAGE_KEY);
  } catch {
    // Storage bloqueado: nada acessível a limpar.
  }
  window.dispatchEvent(new CustomEvent(SCORES_CHANGED_EVENT));
}

function subscribe(callback) {
  window.addEventListener(SCORES_CHANGED_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(SCORES_CHANGED_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

/** Hook React com os scores locais reativos a qualquer mudança. */
export function useLocalScores() {
  return useSyncExternalStore(subscribe, loadLocalScores);
}
