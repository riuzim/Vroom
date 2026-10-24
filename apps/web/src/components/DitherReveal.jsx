import { useEffect, useRef, useState } from 'react';
import { REVEAL_LADDER, ditherPosterize } from '@/lib/dither';

const REVEAL_MS = 900;
const MAX_CANVAS_W = 1280;

/**
 * A revelação da foto: o grande momento da rodada. A imagem nítida nasce como
 * dither 1-bit (Bayer) e sobe a escada de posterize até a cor total — a foto
 * "se revela" como impressão offset. Ao terminar, o canvas some e a <img> nítida
 * por baixo assume. Sem motion (reduced-motion) ou sem canvas/CORS: a <img>
 * aparece direto, sem efeito.
 */
export default function DitherReveal({ src, active }) {
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active || !src) {
      setVisible(false);
      return undefined;
    }
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return undefined;

    let raf = 0;
    let cancelled = false;
    const bail = () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      setVisible(false);
    };

    // Dimensões: o container é aspect 16/10; o backing store acompanha em
    // pixels reais (dpr limitado) e nunca passa de MAX_CANVAS_W de largura.
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = Math.max(Math.round(rect.width * dpr), 2);
    let h = Math.max(Math.round(rect.height * dpr), 2);
    if (w > MAX_CANVAS_W) {
      h = Math.round((h * MAX_CANVAS_W) / w);
      w = MAX_CANVAS_W;
    }
    canvas.width = w;
    canvas.height = h;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timeout = setTimeout(bail, 2500);

    const drawCover = () => {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const target = w / h;
      let sw = iw;
      let sh = iw / target;
      if (sh > ih) {
        sh = ih;
        sw = ih * target;
      }
      ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, w, h);
    };

    img.onload = () => {
      clearTimeout(timeout);
      if (cancelled) return;
      // Ease-out cúbico: os primeiros frames chegam juntos (impacto do 1-bit),
      // os últimos assentam devagar até a foto final.
      const steps = REVEAL_LADDER.length;
      let k = 0;
      let prev = -1;
      const tick = (now) => {
        if (cancelled) return;
        if (k >= steps) {
          setVisible(false);
          return;
        }
        const p = Math.min((now - start) / REVEAL_MS, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        k = Math.min(Math.floor(eased * steps), steps - 1);
        if (k !== prev) {
          prev = k;
          try {
            drawCover();
            const frame = ctx.getImageData(0, 0, w, h);
            ditherPosterize(frame, REVEAL_LADDER[k]);
            ctx.putImageData(frame, 0, 0);
          } catch {
            bail(); // canvas tainted (CORS) — revela direto
            return;
          }
        }
        raf = requestAnimationFrame(tick);
      };
      const start = performance.now();
      setVisible(true);
      raf = requestAnimationFrame(tick);
    };
    img.onerror = bail;
    img.src = src;

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [active, src]);

  if (!visible) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full select-none"
    />
  );
}
