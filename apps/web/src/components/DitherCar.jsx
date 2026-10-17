/**
 * Figura 1-bit com dithering ordenado (matriz Bayer 4×4).
 * Corpo em "bone" via currentColor; faixa e lanterna em flame.
 * Os padrões `dither50` e `dither25` reproduzem os thresholds Bayer
 * (valores < 8 e < 4) como tiles de 4×4 células.
 */
export default function DitherCar({ className }) {
  return (
    <svg
      viewBox="0 0 48 18"
      role="img"
      aria-label="Silhueta 1-bit de um carro esportivo com dithering"
      shapeRendering="crispEdges"
      className={className}
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

      {/* sombra no asfalto — dither 25% */}
      <rect x="4" y="16.5" width="40" height="1" fill="url(#dither25)" />

      {/* corpo do carro */}
      <path
        d="M2 13 V10 H1 V8 L5 7 H7 L9 5 L11 4 L13 3 H32 L34 4 L36 5 L40 6 L44 7 L46 9 H47 V13 Z"
        fill="currentColor"
      />

      {/* vidros — dither 50% */}
      <path d="M14 4 H31 L33.5 6 H16 Z" fill="url(#dither50)" />

      {/* faixa lateral flame */}
      <rect x="3" y="10" width="42" height="1.5" className="text-flame" fill="currentColor" />

      {/* lanterna flame */}
      <rect x="45.5" y="8.5" width="1.5" height="1.5" className="text-flame" fill="currentColor" />

      {/* rodas */}
      <g>
        <circle cx="10" cy="13" r="3.4" fill="currentColor" />
        <circle cx="10" cy="13" r="2.1" fill="#0e0e10" />
        <circle cx="10" cy="13" r="0.8" fill="currentColor" />
      </g>
      <g>
        <circle cx="37" cy="13" r="3.4" fill="currentColor" />
        <circle cx="37" cy="13" r="2.1" fill="#0e0e10" />
        <circle cx="37" cy="13" r="0.8" fill="currentColor" />
      </g>
    </svg>
  );
}
