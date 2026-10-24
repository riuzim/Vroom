/**
 * Efeitos 1-bit portados do PhotoCraft (MIT/Apache-2.0 — github.com/storytold/photocraft),
 * crates/compose/src/adjust.rs: `bayer4` (ordered dither 4×4) e `posterize`
 * (faixas iguais sobre 0..255, como o Photoshop). Adaptados de Rust para canvas 2D.
 */

/** Ordered-dither offset em -0.5..0.5 (matriz Bayer 4×4) para o pixel (x, y). */
export function bayer4(x, y) {
  const M = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  return (M[(y & 3) * 4 + (x & 3)] + 0.5) / 16 - 0.5;
}

/**
 * Posterize estilo Photoshop: `levels` faixas iguais de entrada sobre 0..=255,
 * saída nos níveis `floor(k * 255 / (n - 1))`. `v` em 0..1, retorno em 0..255.
 */
export function posterize(v, levels) {
  const n = Math.min(Math.max(levels, 2), 255);
  const x = Math.round(v * 255);
  const bin = Math.min(Math.floor((x * n) / 256), n - 1);
  return Math.floor((bin * 255) / (n - 1));
}

/** Escada da revelação: do 1-bit puro ao original, faixas do PhotoCraft. */
export const REVEAL_LADDER = [2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96];

/**
 * Posterize + dither Bayer direto no ImageData (RGBA). O threshold Bayer entra
 * como fração de faixa antes da quantização — o modelo do GradientMap dithered
 * do PhotoCraft. `levels` baixos = foto 1-bit; `Infinity`/>=255 = original.
 */
export function ditherPosterize(imageData, levels) {
  const n = Math.min(Math.max(levels, 2), 255);
  const data = imageData.data;
  const { width, height } = imageData;
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const t = bayer4(x, y) + 0.5; // 0..1
      const i = (row + x) << 2;
      for (let c = 0; c < 3; c++) {
        const bin = Math.min(Math.floor((data[i + c] / 255) * n + t), n - 1);
        data[i + c] = Math.round((bin * 255) / (n - 1));
      }
    }
  }
}
