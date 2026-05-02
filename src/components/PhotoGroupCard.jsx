export default function PhotoGroupCard({ group, unlocked, uploads = {}, onClick }) {
  const cover = group.photos.find((p) => p.type === 'main') || group.photos[0]
  const coverSrc = cover ? uploads[cover.id] || cover.imageUrl : null
  const uploadedInGroup = group.photos.filter((p) => uploads[p.id]).length

  return (
    <button
      type="button"
      onClick={() => unlocked && onClick?.(group)}
      className={`card text-left relative overflow-hidden ${
        unlocked ? 'hover:-translate-y-1 transition' : 'cursor-default'
      }`}
    >
      <div
        className={`relative aspect-[4/3] rounded-2xl overflow-hidden border border-beige-200 bg-gradient-to-br ${cover?.gradient || 'from-amber-200 to-rose-200'}`}
      >
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={cover.title}
            className={`w-full h-full object-cover ${unlocked ? '' : 'blur-md grayscale'}`}
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center text-6xl ${
              unlocked ? '' : 'blur-sm grayscale opacity-70'
            }`}
          >
            {unlocked ? cover?.emoji || '📸' : '❔'}
          </div>
        )}
        {!unlocked && (
          <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
            <span className="px-3 py-1 rounded-full bg-white/90 border border-beige-200 text-xs text-ink/70">
              🔒 尚未解锁
            </span>
          </div>
        )}
        {unlocked && (
          <span className="absolute bottom-2 right-2 bg-white/90 border border-beige-200 text-xs px-2 py-0.5 rounded-md">
            📸 {group.photos.length} 张
            {uploadedInGroup > 0 && (
              <span className="ml-1 text-rose">· {uploadedInGroup} 张已上传</span>
            )}
          </span>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-serif font-semibold text-ink">
          {unlocked ? group.title : '???'}
        </h3>
        <p className="text-sm text-ink/70 leading-snug">
          {unlocked ? group.caption : '还没被点亮的记忆……'}
        </p>
      </div>
    </button>
  )
}
