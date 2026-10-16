import { useMemo, useState } from 'react';
import { carNames } from '../data/cars';

export default function GuessInput({ disabled, onSubmit }) {
  const [guess, setGuess] = useState('');
  const suggestions = useMemo(() => {
    const value = guess.trim().toLowerCase();

    if (!value) {
      return [];
    }

    return carNames
      .filter((name) => name.toLowerCase().includes(value))
      .slice(0, 6);
  }, [guess]);

  function handleSubmit(event) {
    event.preventDefault();
    const value = guess.trim();

    if (!value) {
      return;
    }

    onSubmit(value);
    setGuess('');
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={guess}
          onChange={(event) => setGuess(event.target.value)}
          disabled={disabled}
          autoComplete="off"
          placeholder="Digite o nome do carro"
          className="min-h-12 flex-1 rounded-md border border-white/10 bg-panelSoft px-4 text-base font-semibold text-white outline-none transition placeholder:text-white/35 focus:border-flame focus:ring-4 focus:ring-flame/10 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || !guess.trim()}
          className="min-h-12 rounded-md bg-flame px-6 text-sm font-black uppercase tracking-wide text-ink shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Chutar
        </button>
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute z-30 mt-2 max-h-56 w-full overflow-auto rounded-md border border-white/10 bg-panel shadow-2xl">
          {suggestions.map((name) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => setGuess(name)}
                className="w-full px-4 py-3 text-left text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-flame"
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
