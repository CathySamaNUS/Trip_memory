export default function LocationNode({ location, isCompleted, inProgress, onClick }) {
  const status = isCompleted ? 'completed' : location.status
  const isAvailable = status === 'available' || status === 'completed'

  const ring =
    status === 'completed'
      ? 'bg-sage border-sage text-ink'
      : status === 'available'
      ? 'bg-sunny border-sunny text-ink animate-floaty'
      : 'bg-beige-200/70 border-beige-200 text-ink/40 grayscale'

  return (
    <button
      type="button"
      disabled={!isAvailable}
      onClick={() => isAvailable && onClick?.(location)}
      className="absolute -translate-x-1/2 -translate-y-1/2 group"
      style={{ top: location.pos.top, left: location.pos.left }}
      aria-label={location.name}
    >
      <div
        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 ${ring}
          shadow-sticker flex items-center justify-center text-2xl sm:text-3xl
          transition-transform group-hover:scale-110`}
      >
        <span>{location.emoji}</span>
        {status === 'completed' && (
          <span className="absolute -top-2 -right-2 bg-white border-2 border-sage rounded-full w-6 h-6 flex items-center justify-center text-sage text-sm font-black rotate-12">
            ✓
          </span>
        )}
        {status === 'locked' && (
          <span className="absolute -bottom-2 -right-2 text-xs">🔒</span>
        )}
        {inProgress && status === 'available' && (
          <span className="absolute -top-2 -left-2 bg-rose text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 rotate-[-12deg] shadow-sm">
            …
          </span>
        )}
      </div>
      <div className="mt-1 text-center">
        <span className="inline-block px-2 py-0.5 rounded-md bg-white/90 border border-beige-200 text-xs sm:text-sm text-ink shadow-sm whitespace-nowrap">
          📍 {location.name}
        </span>
      </div>
    </button>
  )
}
