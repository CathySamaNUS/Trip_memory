export default function StartPage({ onStart, onAlbum }) {
  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <div className="card max-w-xl w-full text-center paper-grain relative tape-top">
        <div className="text-5xl mb-2">🗺️</div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink tracking-wide">
          重返台湾
        </h1>
        <p className="mt-2 text-ink/70 italic font-serif">
          有些旅程结束了，但记忆还在路上。
        </p>

        <div className="my-6 h-px bg-beige-200" />

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="btn-primary" onClick={onStart}>
            ✨ 开始回忆
          </button>
          <button className="btn" onClick={onAlbum}>
            📔 翻开相册
          </button>
        </div>

        <p className="mt-6 text-xs text-ink/50">
          🎟️ 一本小小的互动旅行剪贴簿．点一下、听一段、记起来。
        </p>
      </div>
    </div>
  )
}
