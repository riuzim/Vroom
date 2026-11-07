import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RoundSummary() {
  const { t } = useTranslation();
  const { mode } = useParams();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link to={`/game/${mode}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 size-4" />
          {t('common.retry')}
        </Button>
      </Link>
      <h1 className="mt-6 text-2xl font-bold">{t('game.summaryTitle', { defaultValue: 'Resumo da rodada' })}</h1>
      <p className="mt-2 text-bone/70">{t('game.summaryBody', { defaultValue: 'Detalhes do carro, pontuação e curiosidades.' })}</p>
    </div>
  );
}
