import { locations, photoGroups as basePhotoGroups } from '../data/travelData.js'

// 给定 eventId，返回属于这个事件的所有「场景照片」上传 key（按字典序排序）。
// 兼容两种格式：
//   - scene:<eventId>           —— 旧的单张格式（legacy）
//   - scene:<eventId>:<id>      —— 新的多张格式
export function getEventSceneKeys(eventId, uploads) {
  const prefix = `scene:${eventId}`
  return Object.keys(uploads || {})
    .filter((k) => k === prefix || k.startsWith(prefix + ':'))
    .sort()
}

// 把用户上传的所有场景照片合并到对应事件的相片集里。
// 合成出来的虚拟照片 id 直接复用 upload key，这样 PhotoGroupModal /
// PhotoGroupCard 里既有的 `uploads[p.id]` 取图、上传、替换、删除逻辑
// 通通能直接用，不需要再多写一套。
export function enrichPhotoGroups(uploads) {
  const groups = {}
  for (const [id, g] of Object.entries(basePhotoGroups)) {
    groups[id] = { ...g, photos: [...g.photos] }
  }

  for (const loc of locations) {
    for (const ev of loc.events || []) {
      const sceneKeys = getEventSceneKeys(ev.id, uploads)
      if (sceneKeys.length === 0) continue
      const targetGroupId = ev.unlockPhotoGroupIds?.[0]
      if (!targetGroupId || !groups[targetGroupId]) continue

      sceneKeys.forEach((key, idx) => {
        if (groups[targetGroupId].photos.some((p) => p.id === key)) return
        groups[targetGroupId].photos.push({
          id: key,
          title: sceneKeys.length > 1 ? `我拍的现场 #${idx + 1}` : '我拍的现场',
          caption: `${ev.time} · ${ev.title}`,
          imageUrl: null,
          type: 'detail',
          emoji: '📷',
          gradient: ev.sceneGradient || 'from-amber-200 to-rose-200',
        })
      })
    }
  }
  return groups
}
