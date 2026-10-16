export default function GameInfo({ attemptsLeft, hint, message, score, status }) {
  const statusClass = status === 'wrong'
    ? 'border-danger/40 bg-danger/10 text-danger shadow-danger'
    : status === 'correct'
      ? 'border-mint/40 bg-mint/10 text-mint shadow-mint'
      : 'border-white/10 bg-white/[0.04] text-white/60';

  return (
    <div className="grid gap-3 sm:grid-cols-[auto,1fr]">
      <div className="rounded-lg bg-flame px-5 py-4 text-center text-ink shadow-glow">
        <p className="text-xs font-black uppercase tracking-wide opacity-70">Score</p>
        <p className="font-mono text-3xl font-black">{score}</p>
      </div>
      <div className={`rounded-lg border px-5 py-4 ${statusClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold">Tentativas: {attemptsLeft}</p>
          <p className="font-mono text-sm tracking-[0.18em] text-white">{hint}</p>
        </div>
        <p className="mt-2 min-h-5 text-sm font-semibold">{message || 'Olhe bem a silhueta e mande seu chute.'}</p>
      </div>
    </div>
  );
}
