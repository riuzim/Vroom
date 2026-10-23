import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConsent } from '@/lib/consent';

/**
 * Slot de anúncio Google AdSense — carregado SÓ depois de consentimento
 * explícito de publicidade (LGPD). Em dev/sem VITE_ADSENSE_CLIENT configurado,
 * não renderiza nada. A altura mínima fixa evita layout shift (CLS).
 *
 * Regra de ouro do plano: usar apenas em Home, Ranking e Perfil — nunca na
 * tela de jogo nem perto de controles (política de cliques acidentais).
 */

let adsScriptPromise = null;

function loadAdsScript(client) {
  if (adsScriptPromise) return adsScriptPromise;
  adsScriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
  return adsScriptPromise;
}

export default function AdSlot({ slot, className = '', minHeight = 280, ...rest }) {
  const { t } = useTranslation();
  const consent = useConsent();
  const client = import.meta.env.VITE_ADSENSE_CLIENT;
  const enabled = Boolean(client) && consent.decided && consent.advertising;

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    loadAdsScript(client).then(() => {
      if (cancelled) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        /* "All ins on this page are already filled" em re-mount: seguro. */
      }
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, client]);

  if (!enabled) return null;

  return (
    <aside className={`w-full ${className}`} aria-label={t('ads.label')} {...rest}>
      <p className="mb-1 text-center font-mono text-[10px] uppercase tracking-widest text-bone/40">
        {t('ads.label')}
      </p>
      <div style={{ minHeight }} className="border-2 border-line bg-raised">
        <ins
          className="adsbygoogle block"
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
