import { describe, expect, it } from 'vitest';
import {
  buildShareText,
  computeStreak,
  getAvailableLetters,
  getHint,
  normalizeGuess,
  pickRandomCar,
} from './game.js';

describe('normalizeGuess', () => {
  it('normaliza caixa, acentos, hífens e espaços extras', () => {
    expect(normalizeGuess('  BMW   E36 ')).toBe('bmw e36');
    expect(normalizeGuess('Mercedes-Benz E-Class')).toBe('mercedes benz e class');
    expect(normalizeGuess('PÓRSCHÊ 911!')).toBe('porsche 911');
    expect(normalizeGuess('Mazda RX-7')).toBe('mazda rx 7');
    expect(normalizeGuess('Porsche 911!!!')).toBe('porsche 911');
  });

  it('devolve string vazia para entrada vazia', () => {
    expect(normalizeGuess('   ')).toBe('');
  });
});

describe('getHint', () => {
  it('mascara letras e mantém espaços, hífens e dígitos visíveis', () => {
    expect(getHint('BMW E36', [])).toBe('___ _36');
    expect(getHint('Mazda RX-7', ['a', 'z', 'd'])).toBe('_azda __-7');
    expect(getHint('Fiat Uno', ['f', 'i', 'a', 't', 'n'])).toBe('Fiat _n_');
  });
});

describe('getAvailableLetters', () => {
  it('lista letras únicas ainda não reveladas', () => {
    expect(getAvailableLetters('BMW E36', ['b'])).toEqual(['m', 'w', 'e']);
    expect(getAvailableLetters('Ferrari F40', [])).toEqual(['f', 'e', 'r', 'a', 'i']);
  });

  it('ignora dígitos, espaços e hífens', () => {
    expect(getAvailableLetters('911 GT3RS', [])).toEqual(['g', 't', 'r', 's']);
  });
});

describe('pickRandomCar', () => {
  const cars = [
    { name: 'Alfa A', imagePath: '/api/cars/1/image' },
    { name: 'Bravo B', imagePath: '/api/cars/2/image' },
  ];

  it('evita repetir o carro atual quando há opções', () => {
    for (let index = 0; index < 20; index += 1) {
      expect(pickRandomCar(cars, cars[0]).name).toBe('Bravo B');
    }
  });

  it('retorna o único carro de um catálogo de 1 item', () => {
    expect(pickRandomCar([cars[0]], cars[0]).name).toBe('Alfa A');
  });
});

describe('buildShareText', () => {
  const base = {
    maxAttempts: 5,
    url: 'https://vroom.game/game/daily',
  };

  it('monta o grid do acerto no daily com número e streak', () => {
    const text = buildShareText({
      ...base,
      mode: 'daily',
      status: 'correct',
      attemptsUsed: 3,
      dailyNumber: 12,
      streak: 7,
    });
    expect(text).toBe('Vroom Daily #12\n🟥🟥🟩 3/5\n🔥 7\nhttps://vroom.game/game/daily');
  });

  it('acerto de primeira no modo livre: sem #N e sem linha de streak', () => {
    const text = buildShareText({
      ...base,
      mode: 'classic',
      status: 'correct',
      attemptsUsed: 1,
      dailyNumber: null,
      streak: 0,
      url: 'https://vroom.game/game/classic',
    });
    expect(text).toBe('Vroom Classic\n🟩 1/5\nhttps://vroom.game/game/classic');
  });

  it('falha mostra X e cinco quadrados vermelhos', () => {
    const text = buildShareText({
      ...base,
      mode: 'themed',
      status: 'failed',
      attemptsUsed: 5,
      dailyNumber: 12,
    });
    expect(text).toBe('Vroom Série #12\n🟥🟥🟥🟥🟥 X/5\nhttps://vroom.game/game/daily');
  });

  it('skip marca tentativas não usadas e nunca vaza o nome do carro', () => {
    const text = buildShareText({
      ...base,
      mode: 'silhouette',
      status: 'skipped',
      attemptsUsed: 2,
      dailyNumber: null,
    });
    expect(text).toBe('Vroom Silhouette\n🟥🟥⬜⬜⬜ X/5\nhttps://vroom.game/game/daily');
  });
});

describe('computeStreak', () => {
  it('sequência viva terminando hoje', () => {
    const result = computeStreak(['2026-11-01', '2026-11-02', '2026-11-03'], '2026-11-03');
    expect(result).toEqual({ current: 3, best: 3 });
  });

  it('jogou ontem e não hoje: streak ainda vivo', () => {
    const result = computeStreak(['2026-11-02'], '2026-11-03');
    expect(result).toEqual({ current: 1, best: 1 });
  });

  it('pausa de 2 dias zera o atual e preserva o recorde', () => {
    const result = computeStreak(['2026-11-01', '2026-11-02', '2026-11-05'], '2026-11-06');
    expect(result).toEqual({ current: 1, best: 2 });
  });

  it('datas duplicadas contam uma vez e lista vazia zera tudo', () => {
    expect(computeStreak(['2026-11-01', '2026-11-01'], '2026-11-01')).toEqual({
      current: 1,
      best: 1,
    });
    expect(computeStreak([], '2026-11-01')).toEqual({ current: 0, best: 0 });
  });

  it('best é a maior sequência histórica mesmo se antiga', () => {
    const result = computeStreak(
      ['2026-10-01', '2026-10-02', '2026-10-03', '2026-11-05'],
      '2026-11-06',
    );
    expect(result).toEqual({ current: 1, best: 3 });
  });
});
