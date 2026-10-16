export default function CarStage({ car, blur, isHardMode, status }) {
  const filter = `blur(${blur}px)${isHardMode ? ' grayscale(100%) contrast(1.08)' : ''}`;

  return (
    <section className="relative overflow-hidden rounded-lg border border-white/10 bg-panel p-3 shadow-2xl">
      <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-black">
        <img
          src={car.imageUrl}
          alt="Carro para adivinhar"
          draggable="false"
          className="h-full w-full select-none object-cover transition duration-700"
          style={{ filter }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/5" />
        <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white/80 backdrop-blur">
          {isHardMode ? 'Hard' : 'Classic'}
        </div>
        {status === 'correct' && (
          <div className="absolute inset-x-4 bottom-4 rounded-md bg-mint px-4 py-3 text-center text-sm font-black uppercase tracking-wide text-ink shadow-mint">
            Boa! Próximo carro chegando
          </div>
        )}
      </div>
    </section>
  );
}
