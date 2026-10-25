const API_BASE = import.meta.env.VITE_API_URL ?? '';

/** Monta a URL absoluta de um caminho da API (respeita VITE_API_URL). */
export function apiUrl(path) {
  return `${API_BASE}${path}`;
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      // Rede estagnada não pode pendurar a UI para sempre: 15s de teto.
      // AbortSignal.timeout rejeita com TimeoutError → cai no catch de rede.
      signal: AbortSignal.timeout(15_000),
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch (cause) {
    // Rede indisponível/offline: evita vazar "Failed to fetch" cru nos toasts.
    const error = new Error(
      'Sem conexão com o servidor. Verifique sua internet e tente novamente.',
    );
    error.code = 'NETWORK_ERROR';
    error.cause = cause;
    throw error;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error ?? 'Não foi possível falar com o servidor.');
    error.status = response.status;
    // Corpo não-JSON (ex.: 502/HTML de um proxy na frente da API) não tem
    // código — INTERNAL_ERROR existe traduzido nos três idiomas.
    error.code = data?.code ?? (data === null ? 'INTERNAL_ERROR' : undefined);
    error.details = data?.details;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  del: (path) => request(path, { method: 'DELETE' }),
};

/**
 * Traduz um erro da API: usa o código quando existir no dicionário de erros,
 * senão cai na mensagem original do servidor.
 */
export function apiErrorMessage(t, error) {
  if (error?.code) {
    const translated = t(`apiErrors.${error.code}`, { defaultValue: '' });
    if (translated) {
      return translated;
    }
  }
  return error?.message ?? '';
}
