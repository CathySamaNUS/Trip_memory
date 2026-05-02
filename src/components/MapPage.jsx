import LocationNode from './LocationNode.jsx'
import { locations } from '../data/travelData.js'

// A stylized scrapbook map of Taiwan. The SVG path is a hand-simplified
// silhouette inspired by Taiwan's real shape — replace later with a real
// map tile or photo if desired.
function TaiwanMap() {
  return (
    <svg
      viewBox="0 0 200 320"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8d8a8" />
          <stop offset="100%" stopColor="#d8b86a" />
        </linearGradient>
        <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.7" fill="#5c4a3a" opacity="0.12" />
        </pattern>
      </defs>
      <path
        d="M105,15
           C130,18 142,40 148,68
           C156,100 162,140 170,180
           C176,215 168,250 150,278
           C135,300 110,310 92,300
           C72,288 60,260 50,225
           C42,195 36,160 38,125
           C40,90 55,55 75,32
           C85,22 95,14 105,15 Z"
        fill="url(#land)"
        stroke="#8a6a3a"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M105,15
           C130,18 142,40 148,68
           C156,100 162,140 170,180
           C176,215 168,250 150,278
           C135,300 110,310 92,300
           C72,288 60,260 50,225
           C42,195 36,160 38,125
           C40,90 55,55 75,32
           C85,22 95,14 105,15 Z"
        fill="url(#dots)"
      />
      {/* Mountain ridge hint */}
      <path
        d="M95,60 Q100,120 110,180 Q115,230 105,275"
        stroke="#8a6a3a"
        strokeOpacity="0.35"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="4 4"
      />
    </svg>
  )
}

export default function MapPage({ completed, chapterProgress = {}, onSelectLocation, onOpenInventory, onOpenAlbum, onHome }) {
  return (
    <div className="min-h-full flex flex-col">
      <header className="px-4 sm:px-8 pt-6 pb-3 text-center">
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-ink">
          🗺️ 台湾旅行地图
        </h1>
        <p className="text-ink/60 text-sm mt-1 italic">
          点一下地图上彩色的图钉，重新打开那段记忆。
        </p>
      </header>

      <div className="flex-1 px-3 sm:px-6 pb-28">
        <div className="card relative paper-grain mx-auto max-w-3xl tape-top">
          <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-sky/60 via-beige-100 to-sage/50 border border-beige-200">
            <TaiwanMap />
            {/* Decorations */}
            <div className="absolute top-3 left-3 text-xs bg-white/80 px-2 py-0.5 rounded-md border border-beige-200 rotate-[-3deg]">
              🧭 北
            </div>
            <div className="absolute bottom-3 right-3 text-xs bg-white/80 px-2 py-0.5 rounded-md border border-beige-200 rotate-[2deg]">
              ✈️ 台北 → 垦丁
            </div>

            {/* Location pins */}
            {locations.map((loc) => (
              <LocationNode
                key={loc.id}
                location={loc}
                isCompleted={completed.includes(loc.id)}
                inProgress={!completed.includes(loc.id) && (chapterProgress[loc.id] || 0) > 0}
                onClick={onSelectLocation}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/85 backdrop-blur border-t border-beige-200 z-40">
        <div className="max-w-3xl mx-auto grid grid-cols-3">
          <button onClick={onOpenInventory} className="py-3 text-sm flex flex-col items-center gap-0.5 hover:bg-beige-100">
            <span className="text-xl">🎒</span>
            <span>行囊</span>
          </button>
          <button onClick={onOpenAlbum} className="py-3 text-sm flex flex-col items-center gap-0.5 hover:bg-beige-100 border-x border-beige-200">
            <span className="text-xl">📔</span>
            <span>相册</span>
          </button>
          <button onClick={onHome} className="py-3 text-sm flex flex-col items-center gap-0.5 hover:bg-beige-100">
            <span className="text-xl">🏠</span>
            <span>首页</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
