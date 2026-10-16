export default function ScorePanel({ title, scores, emptyLabel = 'Ainda sem scores', variant = 'default' }) {
  const medals = ['1º', '2º', '3º'];

  return (
    <aside className="rounded-lg border border-white/10 bg-panel p-5 shadow-xl">
      <h2 className="text-sm font-black uppercase tracking-wide text-flame">{title}</h2>
      <ol className="mt-4 space-y-3">
        {scores.length === 0 && <li className="text-sm text-white/45">{emptyLabel}</li>}
        {scores.map((score, index) => (
          <li key={`${score}-${index}`} className="flex items-center justify-between rounded-md bg-white/[0.04] px-3 py-2 text-sm text-white/80">
            <span className="font-bold text-white/55">{variant === 'best' ? medals[index] ?? `${index + 1}º` : `#${index + 1}`}</span>
            <span className="font-mono font-black text-white">{score}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
