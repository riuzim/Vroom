import { describe, expect, it } from 'vitest';
import { blurFromMistakes, calculatePoints, GAME_MODES, MAX_ATTEMPTS } from './constants.js';

describe('calculatePoints', () => {
  it('vale 10 pontos por tentativa restante', () => {
    expect(calculatePoints(5, 'classic')).toBe(50);
    expect(calculatePoints(1, 'classic')).toBe(10);
    expect(calculatePoints(0, 'classic')).toBe(0);
  });

  it('dobra os pontos no modo hard', () => {
    expect(calculatePoints(5, 'hard')).toBe(100);
    expect(calculatePoints(2, 'hard')).toBe(40);
  });

  it('nunca retorna negativo', () => {
    expect(calculatePoints(-1, 'classic')).toBe(0);
  });
});

describe('blurFromMistakes', () => {
  it('reduz 4px por erro e para no zero', () => {
    expect(blurFromMistakes(0)).toBe(15);
    expect(blurFromMistakes(1)).toBe(11);
    expect(blurFromMistakes(4)).toBe(0);
    expect(blurFromMistakes(99)).toBe(0);
  });

  it('alcança o zero exatamente na última tentativa', () => {
    expect(blurFromMistakes(MAX_ATTEMPTS - 1)).toBe(0);
  });
});

describe('GAME_MODES', () => {
  it('contém os três modos do jogo', () => {
    expect(GAME_MODES).toEqual(['classic', 'hard', 'daily']);
  });
});
