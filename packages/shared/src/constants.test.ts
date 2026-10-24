import { describe, expect, it } from 'vitest';
import {
  blurFromMistakes,
  calculatePoints,
  dailyNumber,
  GAME_MODES,
  MAX_ATTEMPTS,
  themeOfDay,
  THEMES,
} from './constants.js';

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
  it('contém os cinco modos do jogo', () => {
    expect(GAME_MODES).toEqual(['classic', 'hard', 'daily', 'silhouette', 'themed']);
  });
});

describe('themeOfDay', () => {
  it('é determinístico e cicla entre os temas do catálogo', () => {
    expect(themeOfDay('2026-11-01')).toBe(themeOfDay('2026-11-01'));
    expect(THEMES).toContain(themeOfDay('2026-11-01'));
    // Datas consecutivas avançam a rotação (não repete o tema no dia seguinte).
    expect(themeOfDay('2026-11-02')).not.toBe(themeOfDay('2026-11-01'));
  });
});

describe('dailyNumber', () => {
  it('o epoch é o Daily #1', () => {
    expect(dailyNumber('2026-11-01')).toBe(1);
  });

  it('avança um por dia e nunca fica abaixo de 1', () => {
    expect(dailyNumber('2026-11-05')).toBe(5);
    expect(dailyNumber('2026-10-25')).toBe(1);
  });
});
