import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

const GSI_SRC = 'https://accounts.google.com/gsi/client';

/**
 * Garante que o script oficial do Google Identity Services esteja carregado.
 * O script só é baixado quando o botão aparece (Login/Registro) — não no
 * resto do app. Mensagens via i18n.t (sempre no idioma corrente, mesmo
 * dentro de callbacks assíncronos).
 */
function ensureGsiLoaded() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();

  const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
  if (existing) {
    // Script já presente (montagem anterior): espera o GSI nascer. Sem o
    // deadline isto seria um loop a 10Hz para sempre se o script quebrar
    // de um jeito que não dispara onerror.
    return new Promise((resolve, reject) => {
      const startedAt = Date.now();
      const check = () => {
        if (window.google?.accounts?.id) {
          resolve();
          return;
        }
        if (existing.dataset.failed || Date.now() - startedAt > 10_000) {
          reject(new Error(i18n.t('auth.google.notLoaded')));
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
      reject(new Error(i18n.t('auth.google.notLoaded')));
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
  const { t } = useTranslation();
  const containerRef = useRef(null);
  // Handlers via ref: o efeito pode re-renderizar o botão ao trocar o idioma,
  // mas as callbacks lidas são sempre as mais recentes do pai.
  const handlersRef = useRef({ onSuccess, onError });
  handlersRef.current = { onSuccess, onError };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const lang = i18n.resolvedLanguage ?? 'pt-BR';

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
              handlersRef.current.onError?.(new Error(i18n.t('auth.google.noCredential')));
            }
          },
        });
        idApi.renderButton(containerRef.current, {
          size: 'large',
          text: 'continue_with',
          locale: lang,
        });
      })
      .catch((error) => {
        if (!cancelled) handlersRef.current.onError?.(error);
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, lang]);

  if (!clientId) {
    // Em dev, deixa explícito que a opção existe e falta apenas a configuração.
    // Em produção, o botão simplesmente não renderiza (nada quebrado p/ jogador).
    if (import.meta.env.DEV) {
      return (
        <div
          className="flex justify-center rounded-md border border-dashed border-bone/30 px-4 py-2.5 text-sm text-bone/55"
          title={t('auth.google.devPlaceholderTitle')}
        >
          {t('auth.google.devPlaceholder')}
        </div>
      );
    }
    return null;
  }

  // key por idioma: trocar o idioma remonta o container e re-renderiza o botão
  // do GSI no novo locale, sem duplicar widgets.
  return (
    <div
      key={lang}
      ref={containerRef}
      className="flex justify-center"
      role="button"
      aria-label={t('auth.google.ariaLabel')}
    />
  );
}
