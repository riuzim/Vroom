export interface Car {
  name: string;
  imageUrl: string;
}

/** Normaliza um chute: caixa baixa, sem acentos, sem hífens/pontuação, espaços simples. */
export function normalizeGuess(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Máscara do nome com letras reveladas (espaços, hífens e dígitos sempre visíveis). */
export function getHint(name: string, revealedLetters: string[]): string {
  const visible = new Set(revealedLetters.map((letter) => letter.toLowerCase()));

  return name
    .split('')
    .map((char) => {
      if (char === ' ' || char === '-' || /\d/.test(char)) {
        return char;
      }

      return visible.has(char.toLowerCase()) ? char : '_';
    })
    .join('');
}

/** Letras ainda não reveladas de um nome. */
export function getAvailableLetters(name: string, revealedLetters: string[]): string[] {
  const visible = new Set(revealedLetters.map((letter) => letter.toLowerCase()));
  const letters = name.split('').filter((char) => /[a-z]/i.test(char) && !visible.has(char.toLowerCase()));

  return [...new Set(letters.map((letter) => letter.toLowerCase()))];
}

/** Sorteia um carro aleatório, evitando repetir o carro atual. */
export function pickRandomCar(cars: Car[], currentCar?: Car): Car {
  if (cars.length <= 1) {
    return cars[0];
  }

  let nextCar: Car | undefined = currentCar;
  while (!nextCar || nextCar.name === currentCar?.name) {
    nextCar = cars[Math.floor(Math.random() * cars.length)];
  }

  return nextCar;
}
