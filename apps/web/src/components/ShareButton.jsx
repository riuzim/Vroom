import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

async function copyToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback para contextos sem Clipboard API (ex.: http fora do localhost).
  const area = document.createElement('textarea');
  area.value = text;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand('copy');
  area.remove();
  if (!copied) {
    throw new Error('copy failed');
  }
}

/**
 * Botão de share-grid: copia/abre a sheet nativa com o resultado da rodada
 * SEM spoiler do nome do carro (o grid é só marca própria + emoji).
 * `loadText` pode ser async — streak buscado fresco no clique.
 */
export default function ShareButton({ loadText }) {
  const { t } = useTranslation();
  const [isWorking, setIsWorking] = useState(false);

  async function handleShare() {
    if (isWorking) {
      return;
    }
    setIsWorking(true);
    try {
      const text = typeof loadText === 'function' ? await loadText() : loadText;

      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({ text });
          return;
        } catch (error) {
          // Usuário fechou a sheet nativa: silêncio, não é erro.
          if (error?.name === 'AbortError') {
            return;
          }
          // Share falhou por outro motivo: cai pro clipboard.
        }
      }

      await copyToClipboard(text);
      toast.success(t('game.shareCopied'));
    } catch {
      toast.error(t('game.shareFailed'));
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare} disabled={isWorking}>
      <Share2 className="size-4" />
      {t('game.share')}
    </Button>
  );
}
