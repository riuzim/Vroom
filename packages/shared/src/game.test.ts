import { describe, expect, it } from 'vitest';
import { getAvailableLetters, getHint, normalizeGuess, pickRandomCar } from './game.js';

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
    { name: 'Alfa A', imageUrl: 'x' },
    { name: 'Bravo B', imageUrl: 'y' },
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
