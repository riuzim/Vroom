import { useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { carNames } from '@vroom/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function GuessInput({ disabled, onSubmit, hideSuggestions = false }) {
  const [guess, setGuess] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const suggestions = useMemo(() => {
    if (hideSuggestions) {
      return [];
    }

    const value = guess.trim().toLowerCase();

    if (!value) {
      return [];
    }

    return carNames.filter((name) => name.toLowerCase().includes(value)).slice(0, 6);
  }, [guess, hideSuggestions]);

  function handleSubmit(event) {
    event.preventDefault();
    const value = guess.trim();

    if (!value) {
      return;
    }

    onSubmit(value);
    setGuess('');
    setHighlightedIndex(-1);
  }

  function pickSuggestion(name) {
    onSubmit(name);
    setGuess('');
    setHighlightedIndex(-1);
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      setIsFocused(false);
      setHighlightedIndex(-1);
      event.target.blur();
      return;
    }

    if (!isFocused || suggestions.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === 'Enter' && highlightedIndex >= 0) {
      event.preventDefault();
      pickSuggestion(suggestions[highlightedIndex]);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={guess}
          onChange={(event) => {
            setGuess(event.target.value);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoComplete="off"
          placeholder="Manda o nome do carro"
          aria-label="Seu chute"
          {...(hideSuggestions
            ? {}
            : {
                'aria-autocomplete': 'list',
                'aria-controls': 'guess-suggestions',
                'aria-expanded': isFocused && suggestions.length > 0,
              })}
        />
        <Button type="submit" disabled={disabled || !guess.trim()} className="sm:min-w-32">
          <Send className="size-4" />
          Chutar
        </Button>
      </div>

      {isFocused && suggestions.length > 0 && (
        <ul
          id="guess-suggestions"
          className="absolute z-30 mt-2 max-h-56 w-full overflow-auto rounded-none border-2 border-bone bg-popover shadow-hard"
        >
          {suggestions.map((name, index) => (
            <li key={name}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => pickSuggestion(name)}
                className={
                  index === highlightedIndex
                    ? 'w-full px-4 py-3 text-left text-sm font-bold bg-bone/10 text-flame transition focus-visible:outline-none focus-visible:bg-bone/10 focus-visible:text-flame motion-reduce:transition-none'
                    : 'w-full px-4 py-3 text-left text-sm font-bold text-bone/85 transition hover:bg-bone/10 hover:text-flame focus-visible:outline-none focus-visible:bg-bone/10 focus-visible:text-flame motion-reduce:transition-none'
                }
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
