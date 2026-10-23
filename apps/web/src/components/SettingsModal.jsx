import { useState } from 'react';
import { Bug, Languages, Mail, Trash2 } from 'lucide-react';
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
  const [isConfirming, setIsConfirming] = useState(false);

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
          <p className="flex items-center gap-2 pt-1 text-xs font-black uppercase tracking-wide text-bone/55">
            <Languages className="size-4" />
            {t('settings.language')}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map((language) => (
              <Button
                key={language.code}
                variant={i18n.resolvedLanguage === language.code ? 'default' : 'secondary'}
                className={cn(
                  'w-full',
                  i18n.resolvedLanguage === language.code && 'border-2 border-flame',
                )}
                onClick={() => changeLanguage(language.code)}
              >
                {language.label}
              </Button>
            ))}
          </div>
          <Button variant="secondary" className="w-full justify-between" asChild>
            <a href="mailto:vroomfeedback@gmail.com">
              <span className="flex items-center gap-2">
                <Mail className="size-4" />
                {t('settings.feedback')}
              </span>
              <span className="font-mono text-xs font-normal normal-case text-bone/55">
                vroomfeedback@gmail.com
              </span>
            </a>
          </Button>
          <Button variant="secondary" className="w-full justify-between" asChild>
            <a href="mailto:vroomfeedback@gmail.com?subject=Bug%20no%20Vroom">
              <span className="flex items-center gap-2">
                <Bug className="size-4" />
                {t('settings.reportBug')}
              </span>
              <span className="text-xs font-normal normal-case text-bone/55">
                {t('settings.sendEmail')}
              </span>
            </a>
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
