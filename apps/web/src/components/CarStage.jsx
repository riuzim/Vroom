import { useEffect, useState } from 'react';
import { Car } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MAX_ATTEMPTS } from '@vroom/shared';
import { Skeleton } from '@/components/ui/skeleton';

export default function CarStage({
  car,
  blur,
  isHardMode,
  status,
  label = 'Classic',
  carName,
  mode = 'classic',
  mistakes = 0,
}) {
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasFailed(false);
  }, [car.imageUrl]);

  // Silhueta: a foto começa quase preta e a luz sobe a cada erro — no fim
  // da rodada (qualquer status) a imagem revela por completo.
  const isSilhouette = mode === 'silhouette';
  const isRevealed = status === 'correct' || status === 'failed' || status === 'skipped';
  const reveal = isRevealed ? 1 : Math.min(mistakes / (MAX_ATTEMPTS - 1), 1);
  const filter = isSilhouette
    ? `brightness(${(0.08 + 0.92 * reveal).toFixed(3)}) contrast(1.15)`
    : `blur(${blur}px)${isHardMode ? ' grayscale(100%) contrast(1.08)' : ''}`;

  return (
    <section className="relative overflow-hidden rounded-none border-2 border-bone bg-panel p-3 shadow-hard">
      <div className="relative aspect-[16/10] overflow-hidden rounded-none bg-ink">
        {!isLoaded && !hasFailed && <Skeleton className="absolute inset-0 z-10 h-full w-full" />}
        {hasFailed && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 text-bone/70">
            <Car className="size-14" />
            <p className="text-sm font-bold">{t('game.imageError')}</p>
          </div>
        )}
        <img
          src={car.imageUrl}
          alt={t('game.carAlt')}
          draggable="false"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasFailed(true)}
          className={`h-full w-full select-none object-cover transition duration-700 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ filter }}
        />
        <div className="absolute left-4 top-4 rounded-none border-2 border-bone bg-ink px-3 py-1 text-xs font-black uppercase tracking-wide text-bone">
          {label}
        </div>
        {(status === 'correct' || status === 'failed' || status === 'skipped') && (
          <div
            className={`absolute inset-x-4 bottom-4 rounded-none border-2 border-bone px-4 py-3 text-center text-sm font-black uppercase tracking-wide ${
              status === 'correct'
                ? 'bg-acid text-ink'
                : status === 'failed'
                  ? 'bg-danger text-ink'
                  : 'bg-flame text-ink'
            }`}
          >
            {status === 'correct'
              ? t('game.bannerCorrect')
              : carName
                ? t('game.bannerReveal', { name: carName })
                : t('game.bannerNext')}
          </div>
        )}
      </div>
    </section>
  );
}
