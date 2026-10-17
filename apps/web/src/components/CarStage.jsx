import { useEffect, useState } from 'react';
import { Car } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CarStage({ car, blur, isHardMode, status }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasFailed(false);
  }, [car.imageUrl]);

  const filter = `blur(${blur}px)${isHardMode ? ' grayscale(100%) contrast(1.08)' : ''}`;

  return (
    <section className="relative overflow-hidden rounded-none border-2 border-bone bg-panel p-3 shadow-hard">
      <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-black">
        {!isLoaded && !hasFailed && <Skeleton className="absolute inset-0 z-10 h-full w-full" />}
        {hasFailed && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 text-bone/50">
            <Car className="size-14" />
            <p className="text-sm font-bold">Não foi possível carregar a imagem</p>
          </div>
        )}
        <img
          src={car.imageUrl}
          alt="Carro para adivinhar"
          draggable="false"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasFailed(true)}
          className={`h-full w-full select-none object-cover transition duration-700 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ filter }}
        />
        <div className="absolute left-4 top-4 rounded-none border-2 border-bone bg-ink px-3 py-1 text-xs font-black uppercase tracking-wide text-bone">
          {isHardMode ? 'Hard' : 'Classic'}
        </div>
        {status === 'correct' && (
          <div className="absolute inset-x-4 bottom-4 rounded-none border-2 border-bone bg-acid px-4 py-3 text-center text-sm font-black uppercase tracking-wide text-ink">
            Boa! Próximo carro chegando
          </div>
        )}
      </div>
    </section>
  );
}
