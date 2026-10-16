export default function SettingsModal({ isOpen, onClose, onResetScores }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-lg border border-white/10 bg-panel p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl uppercase tracking-[0.18em] text-white">Configurações</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1 text-sm font-bold text-white/75 transition hover:border-flame hover:text-flame"
          >
            Fechar
          </button>
        </div>

        <div className="mt-6 space-y-3 text-sm text-white/70">
          <a className="flex items-center justify-between rounded-md bg-white/[0.04] px-4 py-3 transition hover:bg-white/10 hover:text-flame" href="mailto:vroomfeedback@gmail.com">
            Feedback <span>vroomfeedback@gmail.com</span>
          </a>
          <a className="flex items-center justify-between rounded-md bg-white/[0.04] px-4 py-3 transition hover:bg-white/10 hover:text-flame" href="mailto:vroomfeedback@gmail.com?subject=Bug%20no%20Vroom">
            Reportar bug <span>Email</span>
          </a>
          <button
            type="button"
            onClick={onResetScores}
            className="w-full rounded-md border border-danger/40 px-4 py-3 text-left font-bold text-danger transition hover:bg-danger/10"
          >
            Limpar histórico de scores
          </button>
        </div>
      </div>
    </div>
  );
}
