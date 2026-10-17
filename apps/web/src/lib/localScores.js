import { useSyncExternalStore } from 'react';

const SCORE_STORAGE_KEY = 'vroom:scores';
export const SCORES_CHANGED_EVENT = 'vroom:scores-changed';

let cache = { raw: null, scores: [] };

/** Lê os scores locais com cache estável (seguro para useSyncExternalStore). */
export function loadLocalScores() {
  const raw = localStorage.getItem(SCORE_STORAGE_KEY);

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
  localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scores));
  window.dispatchEvent(new CustomEvent(SCORES_CHANGED_EVENT));
}

export function clearLocalScores() {
  localStorage.removeItem(SCORE_STORAGE_KEY);
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
