import { useEffect, useRef } from 'react';

const GSI_SRC = 'https://accounts.google.com/gsi/client';

/**
 * Garante que o script oficial do Google Identity Services esteja carregado.
 * O script só é baixado quando o botão aparece (Login/Registro) — não no
 * resto do app.
 */
function ensureGsiLoaded() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();

  const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      const check = () => {
        if (window.google?.accounts?.id) {
          resolve();
          return;
        }
        if (existing.dataset.failed) {
          reject(new Error('Não foi possível carregar o login do Google.'));
          return;
        }
        setTimeout(check, 100);
      };
      check();
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.dataset.failed = 'true';
      reject(new Error('Não foi possível carregar o login do Google.'));
    };
    document.head.appendChild(script);
  });
}

/**
 * Botão oficial de login com Google (Google Identity Services).
 * `onSuccess` recebe o ID token (credential) JWT, que é enviado à API
 * (POST /api/auth/google) para validação server-side com verifyIdToken.
 *
 * Requer VITE_GOOGLE_CLIENT_ID; sem ele o componente não renderiza nada.
 */
export default function GoogleLoginButton({ onSuccess, onError }) {
  const containerRef = useRef(null);
  // Handlers via ref: o efeito roda uma vez só, mesmo se o pai re-renderizar.
  const handlersRef = useRef({ onSuccess, onError });
  handlersRef.current = { onSuccess, onError };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return undefined;

    let cancelled = false;

    ensureGsiLoaded()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const idApi = window.google.accounts.id;
        idApi.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) {
              handlersRef.current.onSuccess?.(response.credential);
            } else {
              handlersRef.current.onError?.(
                new Error('Login do Google sem credential.'),
              );
            }
          },
        });
        idApi.renderButton(containerRef.current, {
          size: 'large',
          text: 'continue_with',
          locale: 'pt-BR',
        });
      })
      .catch((error) => {
        if (!cancelled) handlersRef.current.onError?.(error);
      });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (!clientId) {
    // Em dev, deixa explícito que a opção existe e falta apenas a configuração.
    // Em produção, o botão simplesmente não renderiza (nada quebrado p/ jogador).
    if (import.meta.env.DEV) {
      return (
        <div
          className="flex justify-center rounded-md border border-dashed border-bone/30 px-4 py-2.5 text-sm text-bone/55"
          title="Defina VITE_GOOGLE_CLIENT_ID no apps/web/.env (e GOOGLE_CLIENT_ID na API) para ativar"
        >
          Login com Google — defina VITE_GOOGLE_CLIENT_ID para ativar
        </div>
      );
    }
    return null;
  }

  return <div ref={containerRef} className="flex justify-center" role="button" aria-label="Continuar com Google" />;
}
