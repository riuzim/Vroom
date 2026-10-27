import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GAME_VERSION, VERSION_LOG } from '@vroom/shared';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/** Última versão cujo changelog este navegador já viu (bolinha "novo"). */
const SEEN_VERSION_KEY = 'vroom:seen-version';

/**
 * Sinal de versionamento: badge "v{GAME_VERSION}" que abre o histórico de
 * versões (VERSION_LOG do shared). Vive no Header — visível em qualquer
 * página do jogo. A bolinha "novo" aparece uma vez por versão, por
 * navegador — abrir o histórico marca como visto.
 */
export default function VersionBadge() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    setIsNew(localStorage.getItem(SEEN_VERSION_KEY) !== GAME_VERSION);
  }, []);

  function handleOpenChange(next) {
    setOpen(next);
    if (next) {
      localStorage.setItem(SEEN_VERSION_KEY, GAME_VERSION);
      setIsNew(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={t('version.changelogTitle')}
          className="inline-flex items-center gap-1.5 rounded-full border border-bone/20 bg-bone/5 px-3 py-1 font-display text-xs font-semibold uppercase tracking-widest text-bone/70 transition hover:border-flame hover:text-flame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
        >
          <History className="size-3.5" aria-hidden="true" />
          v{GAME_VERSION}
          {isNew && (
            <span className="rounded-full bg-flame px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none text-ink">
              {t('version.new')}
            </span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('version.changelogTitle')}</DialogTitle>
          <DialogDescription>{t('version.changelogDescription')}</DialogDescription>
        </DialogHeader>
        <ol className="max-h-96 space-y-4 overflow-y-auto pr-1">
          {VERSION_LOG.map((entry) => (
            <li
              key={entry.version}
              className="border-b border-bone/10 pb-4 last:border-0 last:pb-0"
            >
              <p className="font-display text-sm font-semibold text-bone">
                v{entry.version}
                <span className="ml-2 text-xs font-normal normal-case text-bone/50">
                  {/* Meio-dia local evita a data "voltar um dia" em UTC-3. */}
                  {new Date(`${entry.date}T12:00:00`).toLocaleDateString()}
                </span>
              </p>
              <ul className="mt-2 space-y-1.5">
                {entry.changes.map((change) => (
                  <li key={change} className="flex gap-2 text-sm text-bone/80">
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-flame"
                    />
                    {change}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  );
}
