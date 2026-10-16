export default function Header({ isHardMode, onToggleHardMode, onOpenSettings }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenSettings}
          className="font-display text-2xl uppercase tracking-[0.22em] text-white transition hover:text-flame"
          aria-label="Abrir configurações"
        >
          Vroom
        </button>

        <div className="flex items-center gap-3">
          <a
            href="https://discord.gg/JTDE5eMv"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-flame/60 hover:text-flame sm:inline-flex"
          >
            Discord
          </a>
          <a
            href="https://github.com/iiai22/Simple_Vroom"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-flame/60 hover:text-flame sm:inline-flex"
          >
            GitHub
          </a>
          <button
            type="button"
            onClick={onToggleHardMode}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
              isHardMode
                ? 'border-flame bg-flame text-ink shadow-glow'
                : 'border-white/15 bg-panel text-white hover:border-flame/60 hover:text-flame'
            }`}
          >
            Hard Mode
          </button>
        </div>
      </nav>
    </header>
  );
}
