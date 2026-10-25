import { useTranslation } from 'react-i18next';

/**
 * Figura 1-bit com dithering ordenado (matriz Bayer 4×4).
 * Corpo em "bone" via currentColor; faixa, lanterna e farol em flame.
 * Os padrões `dither50` e `dither25` reproduzem os thresholds Bayer
 * (valores < 8 e < 4) como tiles de 4×4 células.
 *
 * `launching` dispara a largada: motor acelera, farol acende e o carro
 * sai acelerando pra direita com fumaça de escape no ar e rastro dither.
 * Coreografia via CSS (styles.css): rev 260ms → drive 640ms.
 */
export default function DitherCar({ className, launching = false }) {
  const { t } = useTranslation();
  return (
    <svg
      viewBox="0 0 48 18"
      role="img"
      aria-label={t('ditherCar.ariaLabel')}
      shapeRendering="crispEdges"
      className={`dither-car ${launching ? 'launching' : ''} ${className ?? ''}`}
    >
      <defs>
        <pattern id="dither50" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1" height="1" fill="currentColor" />
          <rect x="2" y="0" width="1" height="1" fill="currentColor" />
          <rect x="1" y="1" width="1" height="1" fill="currentColor" />
          <rect x="3" y="1" width="1" height="1" fill="currentColor" />
          <rect x="0" y="2" width="1" height="1" fill="currentColor" />
          <rect x="2" y="2" width="1" height="1" fill="currentColor" />
          <rect x="1" y="3" width="1" height="1" fill="currentColor" />
          <rect x="3" y="3" width="1" height="1" fill="currentColor" />
        </pattern>
        <pattern id="dither25" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1" height="1" fill="currentColor" />
          <rect x="2" y="0" width="1" height="1" fill="currentColor" />
          <rect x="0" y="2" width="1" height="1" fill="currentColor" />
          <rect x="2" y="2" width="1" height="1" fill="currentColor" />
        </pattern>
      </defs>

      {/* fumaça de escape — irmã do grupo que anda: fica no ar */}
      {launching && (
        <g fill="currentColor" aria-hidden="true">
          <circle className="puff" style={{ '--d': 0 }} cx="4.5" cy="10" r="2.2" />
          <circle className="puff" style={{ '--d': 1 }} cx="3.2" cy="11" r="1.7" />
          <circle className="puff" style={{ '--d': 2 }} cx="5" cy="12.2" r="2.6" />
          <circle className="puff" style={{ '--d': 3 }} cx="3" cy="13" r="1.9" />
        </g>
      )}

      {/* asfalto — fica no chão; o carro parte sobre ele */}
      <rect className="car-shadow" x="4" y="16.5" width="40" height="1" fill="url(#dither25)" />

      <g className={launching ? 'car-drive' : undefined}>
        {/* corpo do carro */}
        <path
          d="M2 13 V10 H1 V8 L5 7 H7 L9 5 L11 4 L13 3 H32 L34 4 L36 5 L40 6 L44 7 L46 9 H47 V13 Z"
          fill="currentColor"
        />

        {/* vidros — dither 50% */}
        <path d="M14 4 H31 L33.5 6 H16 Z" fill="url(#dither50)" />

        {/* faixa lateral flame */}
        <rect x="3" y="10" width="42" height="1.5" className="text-flame" fill="currentColor" />

        {/* lanterna flame — luz de freio piscando em marcha lenta */}
        <rect
          x="45.5"
          y="8.5"
          width="1.5"
          height="1.5"
          className="text-flame brake-light"
          fill="currentColor"
        />

        {/* farol — acende na largada */}
        {launching && (
          <rect
            x="45.2"
            y="10.6"
            width="1.8"
            height="1.2"
            className="text-flame headlight"
            fill="currentColor"
          />
        )}

        {/* rastro de velocidade — dither atrás do carro */}
        {launching && (
          <g fill="url(#dither25)" aria-hidden="true">
            <rect className="line" style={{ '--d': 0 }} x="-13" y="9.2" width="9" height="0.6" />
            <rect className="line" style={{ '--d': 1 }} x="-10" y="11.2" width="7" height="0.6" />
            <rect className="line" style={{ '--d': 2 }} x="-12" y="13.2" width="8" height="0.6" />
          </g>
        )}

        {/* rodas — calota com raio central; gira na largada */}
        <g className={launching ? 'wheel-spin wheel-a' : undefined}>
          <circle cx="10" cy="13" r="3.4" fill="currentColor" />
          <circle cx="10" cy="13" r="2.1" fill="#0e0e10" />
          <rect x="9.65" y="11" width="0.7" height="4" fill="currentColor" />
          <circle cx="10" cy="13" r="0.8" fill="currentColor" />
        </g>
        <g className={launching ? 'wheel-spin wheel-b' : undefined}>
          <circle cx="37" cy="13" r="3.4" fill="currentColor" />
          <circle cx="37" cy="13" r="2.1" fill="#0e0e10" />
          <rect x="36.65" y="11" width="0.7" height="4" fill="currentColor" />
          <circle cx="37" cy="13" r="0.8" fill="currentColor" />
        </g>
      </g>
    </svg>
  );
}
