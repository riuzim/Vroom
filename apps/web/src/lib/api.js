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
    error.code = data?.code;
    error.details = data?.details;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
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
