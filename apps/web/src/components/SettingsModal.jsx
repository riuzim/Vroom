import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Languages, MessageSquarePlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { changeLanguage, LANGUAGES } from '@/i18n';
import { cn } from '@/lib/utils';

export default function SettingsModal({ isOpen, onClose, onResetScores }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);

  // Fechar (ESC/clique fora) no meio da confirmação não pode deixar o
  // botão armado para a próxima abertura.
  useEffect(() => {
    if (!isOpen) {
      setIsConfirming(false);
    }
  }, [isOpen]);

  function handleReset() {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }
    onResetScores?.();
    toast.success(t('settings.scoresCleared'));
    setIsConfirming(false);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
          <DialogDescription>{t('settings.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <p className="flex items-center gap-2 pt-1 font-display text-xs font-semibold uppercase tracking-widest text-bone/55">
            <Languages className="size-4" />
            {t('settings.language')}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map((language) => (
              <Button
                key={language.code}
                variant={i18n.resolvedLanguage === language.code ? 'default' : 'secondary'}
                className={cn('w-full', i18n.resolvedLanguage === language.code && 'border-flame')}
                onClick={() => changeLanguage(language.code)}
              >
                {language.label}
              </Button>
            ))}
          </div>
          <Button
            variant="secondary"
            className="w-full justify-start"
            onClick={() => {
              onClose();
              navigate('/feedback');
            }}
          >
            <MessageSquarePlus className="size-4" />
            {t('settings.feedback')}
          </Button>
          <Button variant="destructive" className="w-full justify-start" onClick={handleReset}>
            <Trash2 className="size-4" />
            {isConfirming ? t('settings.confirmClear') : t('settings.clearScores')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
