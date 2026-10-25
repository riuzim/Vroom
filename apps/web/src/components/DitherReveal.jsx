import { useEffect, useRef, useState } from 'react';
import { REVEAL_LADDER, ditherPosterize } from '@/lib/dither';

const REVEAL_MS = 900;
const MAX_CANVAS_W = 1280;

/**
 * A revelação da foto: o grande momento da rodada. A imagem nítida nasce como
 * dither 1-bit (Bayer) e sobe a escada de posterize até a cor total — a foto
 * "se revela" como impressão offset. Ao terminar, o canvas some e a <img> nítida
 * por baixo assume.
 *
 * O canvas fica SEMPRE montado (visibilidade via CSS) — o efeito antigo
 * condicionava o mount ao estado interno e nunca saía do lugar. O download é
 * abortável (fetch + AbortController), o frame 0 é desenhado antes do canvas
 * aparecer (nunca há flash da foto nítida) e reduced-motion pula direto.
 */
export default function DitherReveal({ src, active }) {
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    if (!active || !src) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined; // Sem efeito: a <img> nítida assume direto.
    }

    let raf = 0;
    let cancelled = false;
    let objectUrl = null;
    const controller = new AbortController();

    const stop = () => {
      if (!cancelled) {
        cancelled = true;
        cancelAnimationFrame(raf);
        setVisible(false);
      }
    };

    fetch(src, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`image ${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        if (cancelled) return undefined;
        objectUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          if (cancelled) return;
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d', { willReadFrequently: true });
          if (!canvas || !ctx) {
            stop();
            return;
          }

          // Backing store em pixels reais (dpr limitado), teto de largura.
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

          // Frame 0 sincronamente: quando o canvas aparece, já é 1-bit.
          try {
            drawCover();
            const first = ctx.getImageData(0, 0, w, h);
            ditherPosterize(first, REVEAL_LADDER[0]);
            ctx.putImageData(first, 0, 0);
          } catch {
            stop(); // canvas contaminado (CORS): revela direto.
            return;
          }
          setVisible(true);

          const start = performance.now();
          const steps = REVEAL_LADDER.length;
          let k = 0;
          const tick = (now) => {
            if (cancelled) return;
            if (k >= steps) {
              setVisible(false);
              return;
            }
            const p = Math.min((now - start) / REVEAL_MS, 1);
            const eased = 1 - Math.pow(1 - p, 3); // ease-out cúbico
            const next = Math.min(Math.floor(eased * steps), steps - 1);
            if (next !== k) {
              k = next;
              try {
                drawCover();
                const frame = ctx.getImageData(0, 0, w, h);
                ditherPosterize(frame, REVEAL_LADDER[k]);
                ctx.putImageData(frame, 0, 0);
              } catch {
                stop();
                return;
              }
            }
            raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        };
        img.onerror = () => stop();
        img.src = objectUrl;
        return undefined;
      })
      .catch(() => stop()); // abort/rede/CORS: a <img> nítida assume direto.

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      controller.abort();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [active, src]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full select-none transition-opacity duration-150 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    />
  );
}
