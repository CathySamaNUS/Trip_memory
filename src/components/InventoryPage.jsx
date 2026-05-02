import ItemCard from './ItemCard.jsx'
import { items as ALL_ITEMS } from '../data/travelData.js'

export default function InventoryPage({ collectedItemIds, onBack }) {
  const list = collectedItemIds.map((id) => ALL_ITEMS[id]).filter(Boolean)
  const total = Object.keys(ALL_ITEMS).length

  return (
    <div className="min-h-full p-4 sm:p-8">
      <header className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="btn !py-2 !px-3 text-sm">← 回地图</button>
        <h1 className="flex-1 text-center font-serif text-2xl font-semibold">
          🎒 行囊
        </h1>
        <div className="w-[68px]" />
      </header>

      <p className="text-center text-ink/60 text-sm italic mb-5">
        已收集 {list.length} / {total} 件纪念品
      </p>

      {list.length === 0 ? (
        <div className="card max-w-md mx-auto text-center text-ink/70 italic">
          行囊还是空的──走一走，捡起一两段记忆吧。
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {list.map((it) => (
            <ItemCard key={it.id} item={it} />
          ))}
        </div>
      )}
    </div>
  )
}
