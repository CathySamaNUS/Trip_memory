import { useMemo, useState } from 'react'
import PhotoGroupCard from './PhotoGroupCard.jsx'
import PhotoGroupModal from './PhotoGroupModal.jsx'
import { enrichPhotoGroups } from '../lib/photoMerge.js'

export default function AlbumPage({
  unlockedPhotoGroupIds,
  uploads = {},
  onUpload,
  onRemoveUpload,
  onBack,
}) {
  const [openId, setOpenId] = useState(null)
  // 把回忆页上传的场景照片合并进各自的相片集
  const enriched = useMemo(() => enrichPhotoGroups(uploads), [uploads])
  const all = Object.values(enriched)
  const totalPhotos = all.reduce((s, g) => s + g.photos.length, 0)
  const unlockedPhotos = all
    .filter((g) => unlockedPhotoGroupIds.includes(g.id))
    .reduce((s, g) => s + g.photos.length, 0)
  const uploadedCount = Object.keys(uploads).length
  const open = openId ? enriched[openId] : null

  return (
    <div className="min-h-full p-4 sm:p-8">
      <header className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="btn !py-2 !px-3 text-sm">← 返回</button>
        <h1 className="flex-1 text-center font-serif text-2xl font-semibold">
          📔 相册
        </h1>
        <div className="w-[68px]" />
      </header>

      <p className="text-center text-ink/60 text-sm italic mb-1">
        已解锁 {unlockedPhotoGroupIds.length} / {all.length} 组相片．共 {unlockedPhotos} / {totalPhotos} 张
      </p>
      <p className="text-center text-ink/50 text-xs mb-5">
        💡 已上传 {uploadedCount} 张真实照片．点开任意相片集即可上传或替换
      </p>

      {all.length === 0 ? (
        <div className="card max-w-md mx-auto text-center text-ink/70 italic">
          数据里还没有任何相片集。
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {all.map((g) => (
            <PhotoGroupCard
              key={g.id}
              group={g}
              uploads={uploads}
              unlocked={unlockedPhotoGroupIds.includes(g.id)}
              onClick={(group) => setOpenId(group.id)}
            />
          ))}
        </div>
      )}

      <PhotoGroupModal
        group={open}
        uploads={uploads}
        onUpload={onUpload}
        onRemoveUpload={onRemoveUpload}
        onClose={() => setOpenId(null)}
      />
    </div>
  )
}
