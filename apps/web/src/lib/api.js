const API_BASE = import.meta.env.VITE_API_URL ?? '';

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
    const error = new Error('Sem conexão com o servidor. Verifique sua internet e tente novamente.');
    error.cause = cause;
    throw error;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error ?? 'Não foi possível falar com o servidor.');
    error.status = response.status;
    error.details = data?.details;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
};
