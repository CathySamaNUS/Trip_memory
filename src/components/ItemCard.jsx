export default function ItemCard({ item, isNew = false }) {
  return (
    <div className="card relative animate-pop">
      {isNew && <span className="stamp">新</span>}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-beige-100 border border-beige-200 flex items-center justify-center text-3xl shadow-inner">
          {item.emoji}
        </div>
        <div className="min-w-0">
          <h3 className="font-serif font-semibold text-base text-ink truncate">{item.name}</h3>
          <p className="text-sm text-ink/70 leading-snug">{item.description}</p>
        </div>
      </div>
    </div>
  )
}
