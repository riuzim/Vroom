export * from './constants.js';
export * from './feedback.js';
export * from './game.js';
export * from './names.js';
// `cars.js` (nome ↔ imageUrl) fica FORA do barrel de propósito:
// o cliente só pode enxergar `carNames` (nomes puros, sem URLs).
// A API e o seed importam via '@vroom/shared/cars'.
