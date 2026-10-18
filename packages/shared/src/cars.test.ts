import { describe, expect, it } from 'vitest';
import { cars } from './cars.js';
import { carNames } from './names.js';

describe('catálogo vs lista de nomes', () => {
  it('carNames acompanha cars exatamente (mesma ordem)', () => {
    expect([...carNames]).toEqual(cars.map((car) => car.name));
  });

  it('não há nomes duplicados no catálogo', () => {
    const names = cars.map((car) => car.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
