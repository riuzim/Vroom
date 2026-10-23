import { useState } from 'react';
import { Bug, Mail, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function SettingsModal({ isOpen, onClose, onResetScores }) {
  const [isConfirming, setIsConfirming] = useState(false);

  function handleReset() {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }
    onResetScores?.();
    toast.success('Sequências apagadas.');
    setIsConfirming(false);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>Feedback, bugs e seus dados locais.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Button variant="secondary" className="w-full justify-between" asChild>
            <a href="mailto:vroomfeedback@gmail.com">
              <span className="flex items-center gap-2">
                <Mail className="size-4" />
                Feedback
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
                Reportar bug
              </span>
              <span className="text-xs font-normal normal-case text-bone/55">Enviar email</span>
            </a>
          </Button>
          <Button variant="destructive" className="w-full justify-start" onClick={handleReset}>
            <Trash2 className="size-4" />
            {isConfirming ? 'Confirmar limpeza?' : 'Limpar sequências salvas'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
