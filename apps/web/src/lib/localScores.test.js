import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { clearLocalScores, saveLocalScores, useLocalScores } from './localScores';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('localScores', () => {
  it('salva, lê e limpa scores', () => {
    saveLocalScores([3, 7]);
    let value = renderHook(() => useLocalScores()).result.current;
    expect(value).toEqual([3, 7]);

    clearLocalScores();
    value = renderHook(() => useLocalScores()).result.current;
    expect(value).toEqual([]);
  });

  it('reage a mudanças disparadas por outra aba (evento storage)', () => {
    const { result } = renderHook(() => useLocalScores());
    expect(result.current).toEqual([]);

    act(() => {
      saveLocalScores([12]);
    });
    expect(result.current).toEqual([12]);
  });

  it('ignora conteúdo corrompido', () => {
    localStorage.setItem('vroom:scores', 'não é json{{{');
    const value = renderHook(() => useLocalScores()).result.current;
    expect(value).toEqual([]);
  });
});
