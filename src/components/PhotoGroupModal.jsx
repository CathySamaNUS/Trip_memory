import { useEffect, useRef, useState } from 'react'

function PhotoFrame({ photo, src }) {
  return (
    <div
      className={`relative aspect-[4/3] w-full rounded-2xl border border-beige-200 overflow-hidden bg-gradient-to-br ${photo.gradient || 'from-amber-200 to-rose-200'} animate-fadeIn`}
    >
      {src ? (
        <img src={src} alt={photo.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-7xl">
          {photo.emoji || '📸'}
        </div>
      )}
      {photo.type === 'main' && (
        <span className="absolute top-2 left-2 bg-white/90 text-xs px-2 py-0.5 rounded-md border border-beige-200">
          ⭐ 主图
        </span>
      )}
    </div>
  )
}

function UploadControls({ photo, isUploaded, onPick, onRemove, busy }) {
  const inputRef = useRef(null)
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onPick(file)
          e.target.value = ''
        }}
      />
      <button
        className="btn !py-1.5 !px-3 text-xs"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
      >
        {busy ? '处理中…' : isUploaded ? '🔁 替换照片' : '📷 上传照片'}
      </button>
      {isUploaded && (
        <button
          className="btn !py-1.5 !px-3 text-xs bg-rose/30 border-rose"
          onClick={onRemove}
          disabled={busy}
        >
          🗑️ 移除
        </button>
      )}
      {isUploaded && (
        <span className="text-[11px] text-ink/50">已替换为真实照片</span>
      )}
    </div>
  )
}

export default function PhotoGroupModal({
  group,
  uploads = {},
  onUpload,
  onRemoveUpload,
  onClose,
}) {
  const [view, setView] = useState('carousel') // 'carousel' | 'grid'
  const [index, setIndex] = useState(0)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!group) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(group.photos.length - 1, i + 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [group, onClose])

  useEffect(() => {
    if (!group) {
      setIndex(0)
      setError(null)
    }
  }, [group])

  if (!group) return null
  const photos = group.photos
  const total = photos.length
  // 防御：照片数量可能因为「删除场景照片」而变小
  const safeIndex = Math.min(index, Math.max(0, total - 1))
  const photo = photos[safeIndex]

  const srcFor = (p) => uploads[p.id] || p.imageUrl || null

  const handlePick = async (photoId, file) => {
    setError(null)
    setBusyId(photoId)
    try {
      await onUpload?.(photoId, file)
    } catch (err) {
      setError(err?.message || '上传失败')
    } finally {
      setBusyId(null)
    }
  }

  const handleRemove = async (photoId) => {
    setError(null)
    try {
      await onRemoveUpload?.(photoId)
    } catch (err) {
      setError(err?.message || '移除失败')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-3xl relative tape-top max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-serif text-xl font-semibold text-ink truncate">
              📔 {group.title}
            </h2>
            <p className="text-sm text-ink/70 mt-0.5">{group.caption}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="btn !py-1.5 !px-3 text-xs"
              onClick={() => setView(view === 'carousel' ? 'grid' : 'carousel')}
            >
              {view === 'carousel' ? '▦ 全部' : '▭ 单张'}
            </button>
            <button
              className="btn !py-1.5 !px-3 text-xs"
              onClick={onClose}
              aria-label="关闭"
            >
              ✕
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 px-3 py-2 rounded-md bg-rose/30 border border-rose text-sm text-ink">
            ⚠️ {error}
          </div>
        )}

        {view === 'carousel' ? (
          <div className="mt-3">
            <PhotoFrame photo={photo} src={srcFor(photo)} />

            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                className="btn !py-2 !px-3 text-sm disabled:opacity-40"
                onClick={() => setIndex(Math.max(0, safeIndex - 1))}
                disabled={safeIndex === 0}
              >
                ← 上一张
              </button>
              <div className="text-center min-w-0 flex-1">
                <h3 className="font-serif font-semibold truncate">{photo.title}</h3>
                <p className="text-xs text-ink/60 truncate">{photo.caption}</p>
                <div className="text-[10px] text-ink/50 mt-0.5">{safeIndex + 1} / {total}</div>
              </div>
              <button
                className="btn !py-2 !px-3 text-sm disabled:opacity-40"
                onClick={() => setIndex(Math.min(total - 1, safeIndex + 1))}
                disabled={safeIndex === total - 1}
              >
                下一张 →
              </button>
            </div>

            <div className="flex justify-center gap-1 mt-2">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setIndex(i)}
                  className={`w-2 h-2 rounded-full ${i === safeIndex ? 'bg-ink' : uploads[p.id] ? 'bg-rose/70' : 'bg-ink/20'}`}
                  aria-label={`第 ${i + 1} 张`}
                />
              ))}
            </div>

            {/* 上传控制 */}
            <div className="mt-4 pt-3 border-t border-beige-200">
              <UploadControls
                photo={photo}
                isUploaded={!!uploads[photo.id]}
                busy={busyId === photo.id}
                onPick={(file) => handlePick(photo.id, file)}
                onRemove={() => handleRemove(photo.id)}
              />
              <p className="mt-2 text-center text-[11px] text-ink/50">
                上传的照片会自动压缩并保存在浏览器本地（IndexedDB），刷新不会丢。
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((p, i) => (
              <div key={p.id} className="space-y-1">
                <button
                  onClick={() => {
                    setIndex(i)
                    setView('carousel')
                  }}
                  className="text-left w-full"
                >
                  <PhotoFrame photo={p} src={srcFor(p)} />
                </button>
                <div className="text-sm font-semibold truncate">{p.title}</div>
                <div className="text-xs text-ink/60 truncate">{p.caption}</div>
                <UploadControls
                  photo={p}
                  isUploaded={!!uploads[p.id]}
                  busy={busyId === p.id}
                  onPick={(file) => handlePick(p.id, file)}
                  onRemove={() => handleRemove(p.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
