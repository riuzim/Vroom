import { useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { carNames } from '@/data/cars';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function GuessInput({ disabled, onSubmit }) {
  const [guess, setGuess] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const suggestions = useMemo(() => {
    const value = guess.trim().toLowerCase();

    if (!value) {
      return [];
    }

    return carNames.filter((name) => name.toLowerCase().includes(value)).slice(0, 6);
  }, [guess]);

  function handleSubmit(event) {
    event.preventDefault();
    const value = guess.trim();

    if (!value) {
      return;
    }

    onSubmit(value);
    setGuess('');
    setIsFocused(false);
  }

  function pickSuggestion(name) {
    onSubmit(name);
    setGuess('');
    setIsFocused(false);
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={guess}
          onChange={(event) => setGuess(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          autoComplete="off"
          placeholder="Digite o nome do carro"
          aria-label="Seu chute"
        />
        <Button type="submit" disabled={disabled || !guess.trim()} className="sm:min-w-32">
          <Send className="size-4" />
          Chutar
        </Button>
      </div>

      {isFocused && suggestions.length > 0 && (
        <ul className="absolute z-30 mt-2 max-h-56 w-full overflow-auto rounded-md border border-white/10 bg-popover shadow-2xl">
          {suggestions.map((name) => (
            <li key={name}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pickSuggestion(name)}
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
