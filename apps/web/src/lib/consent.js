import { useSyncExternalStore } from 'react';

/**
 * Consent store — fonte única de verdade do consentimento de cookies do
 * Vroom (LGPD: opt-in, categorias desmarcadas por padrão, revogável).
 *
 * Persistido em localStorage (`vroom:consent:v1`); componentes assinam via
 * `useConsent()` (useSyncExternalStore). Antes de qualquer script do Google
 * ser carregado, o Consent Mode v2 é inicializado com tudo NEGADO via
 * dataLayer/gtag — e atualizado quando o usuário escolhe.
 */

const STORAGE_KEY = 'vroom:consent:v1';
const CHANGE_EVENT = 'vroom:consent-change';

const DEFAULT = { advertising: false, analytics: false, decided: false };

function readStoredConsent() {
  if (typeof localStorage === 'undefined') return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return { ...DEFAULT };
    return {
      advertising: !!parsed.advertising,
      analytics: !!parsed.analytics,
      decided: !!parsed.decided,
    };
  } catch {
    return { ...DEFAULT };
  }
}

function saveConsent(next) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* localStorage cheio/bloqueado: segue com o valor em memória. */
  }
}

function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

/**
 * Estado em MEMÓRIA com referência estável — o contrato do
 * useSyncExternalStore exige que getSnapshot devolva sempre o MESMO objeto
 * até haver mudança; criar objeto novo a cada chamada causa loop de
 * re-render. Sincronização entre abas não é necessária para consentimento
 * (decisão única por visitante).
 */
let state = readStoredConsent();

/** Estado atual do consentimento (cópia defensiva). */
export function getConsent() {
  return { ...state };
}

/**
 * Mescla `partial` no estado, persiste e notifica assinantes. Qualquer
 * escolha marca `decided: true`; `{ decided: false }` EXPLÍCITO reabre o
 * fluxo (usado pela página /cookies para revogar).
 */
export function setConsent(partial) {
  const next = { ...state, ...partial };
  if (partial.decided === undefined) next.decided = true;
  state = next;
  saveConsent(state);
  notifyChange();
}

/** Uma categoria só vale `true` se o usuário decidiu E marcou ela. */
export function consentFor(category) {
  // Essenciais (sessão de login) nunca dependem de consentimento.
  if (category === 'essential') return true;
  if (!state.decided) return false;
  return !!state[category];
}

/** Hook React: re-renderiza em qualquer mudança de consentimento. */
export function useConsent() {
  return useSyncExternalStore(subscribeConsent, getSnapshot, getSnapshot);
}

function getSnapshot() {
  return state;
}

function subscribeConsent(callback) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

// ---------------------------------------------------------------------------
// Consent Mode v2 (shim mínimo de gtag/dataLayer).
// O AdSense/GA leem o estado "consent" do dataLayer; o padrão é NEGADO antes
// de qualquer tag carregar, e é atualizado quando o usuário decide.
// ---------------------------------------------------------------------------

/** Avisa que há uma CMP externa (ex.: Google CMP) cuidando do consentimento. */
export function hasExternalCmp() {
  return typeof window !== 'undefined' && typeof window.__tcfapi__ === 'function';
}

function updateConsentMode(consent) {
  if (!consent.decided) return;
  const granted = (value) => (value ? 'granted' : 'denied');
  window.dataLayer.push([
    'consent',
    'update',
    {
      ad_storage: granted(consent.advertising),
      ad_user_data: granted(consent.advertising),
      ad_personalization: granted(consent.advertising),
      analytics_storage: granted(consent.analytics),
    },
  ]);
}

if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
  // Padrão NEGADO — precisa estar no dataLayer antes de qualquer script Google.
  window.dataLayer.push([
    'consent',
    'default',
    {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    },
  ]);
  window.addEventListener(CHANGE_EVENT, () => updateConsentMode(state));
}
