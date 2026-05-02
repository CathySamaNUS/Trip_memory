import { useEffect, useMemo, useRef, useState } from 'react'
import DialogBox from './DialogBox.jsx'
import PhotoGroupModal from './PhotoGroupModal.jsx'
import { items as ALL_ITEMS } from '../data/travelData.js'
import { enrichPhotoGroups, getEventSceneKeys } from '../lib/photoMerge.js'

function findPart(location, partId) {
  return location.parts?.find((p) => p.id === partId)
}

// 收集每个段落第一次出现的位置（按 part 名去重，因为数据里允许两个不同 partId 共用同一个名字）。
function buildPartChips(location) {
  const seenNames = new Set()
  const chips = []
  for (let i = 0; i < (location.events?.length || 0); i++) {
    const ev = location.events[i]
    const p = location.parts?.find((pp) => pp.id === ev.partId)
    if (!p || seenNames.has(p.name)) continue
    seenNames.add(p.name)
    chips.push({ name: p.name, firstEventIdx: i, firstEvent: ev })
  }
  return chips
}

export default function MemoryPage({
  location,
  initialEventIndex = 0,
  isReplay = false,
  uploads = {},
  onUpload,
  onRemoveUpload,
  onComplete,
  onBack,
  onCollectItem,
  onUnlockPhotoGroup,
  onProgress,
}) {
  const totalEvents = location.events.length
  const safeStart = Math.min(Math.max(0, initialEventIndex), totalEvents - 1)

  const [eventIndex, setEventIndex] = useState(safeStart)
  const [interactedSet, setInteractedSet] = useState(() => {
    const s = new Set()
    const limit = isReplay ? totalEvents : safeStart
    for (let i = 0; i < limit; i++) s.add(i)
    return s
  })

  const [openGroupId, setOpenGroupId] = useState(null)
  const [sceneError, setSceneError] = useState(null)
  const [sceneBusy, setSceneBusy] = useState(false)
  const [sceneIndex, setSceneIndex] = useState(0)
  const [showPartMenu, setShowPartMenu] = useState(false)
  const sceneFileRef = useRef(null)
  const partMenuRef = useRef(null)

  const event = location.events[eventIndex]
  const isLast = eventIndex === totalEvents - 1
  const isFirst = eventIndex === 0
  const part = findPart(location, event.partId)
  const showParts = (location.parts?.length || 0) > 1
  const interacted = interactedSet.has(eventIndex)
  const partChips = useMemo(() => buildPartChips(location), [location])

  // 当前事件下的「场景上传」key 列表（兼容 legacy 单张）
  const sceneKeys = useMemo(
    () => getEventSceneKeys(event.id, uploads),
    [event.id, uploads],
  )
  const sceneUploadCount = sceneKeys.length

  // 相片集要做 enrichment：把场景上传作为虚拟照片合并进对应 group
  const enrichedGroups = useMemo(() => enrichPhotoGroups(uploads), [uploads])
  const unlockedGroups = useMemo(
    () =>
      (event.unlockPhotoGroupIds || [])
        .map((id) => enrichedGroups[id])
        .filter(Boolean),
    [event, enrichedGroups],
  )

  // 场景轮播实际遍历的「所有有图的卡片」：场景上传 + 相片集中已经有可见图源的照片。
  // 这样玩家在相册里上传过的相片集照片，也会出现在回忆页轮播里。
  const eventPhotoSlots = useMemo(() => {
    const slots = []
    // 1. 场景上传（这一段「我自己拍的」）
    for (const key of sceneKeys) {
      slots.push({
        id: key,
        src: uploads[key],
        isUpload: true,
        kind: 'scene',
      })
    }
    // 2. 相片集里有图的照片（数据自带的或用户上传的）
    for (const groupId of event.unlockPhotoGroupIds || []) {
      const g = enrichedGroups[groupId]
      if (!g) continue
      for (const p of g.photos) {
        // enrich 后里面也含场景照片，避免重复
        if (p.id.startsWith(`scene:${event.id}`)) continue
        const upload = uploads[p.id]
        const src = upload || p.imageUrl
        if (!src) continue
        slots.push({
          id: p.id,
          src,
          isUpload: !!upload,
          kind: 'group',
          title: p.title,
          caption: p.caption,
        })
      }
    }
    return slots
  }, [sceneKeys, uploads, enrichedGroups, event.unlockPhotoGroupIds, event.id])

  const slotCount = eventPhotoSlots.length
  const safeSceneIndex = Math.min(sceneIndex, Math.max(0, slotCount - 1))
  const currentSlot = eventPhotoSlots[safeSceneIndex] || null
  const sceneSrc = currentSlot?.src || event.backgroundImage || null
  const hasScenePhoto = slotCount > 0

  // 切换事件时重置场景轮播位置
  useEffect(() => {
    setSceneIndex(0)
  }, [event.id])

  // 数量变化时把索引收敛到合法位置
  useEffect(() => {
    if (slotCount === 0) {
      if (sceneIndex !== 0) setSceneIndex(0)
    } else if (sceneIndex >= slotCount) {
      setSceneIndex(slotCount - 1)
    }
  }, [slotCount, sceneIndex])

  // 段落跳转菜单：点外面关闭
  useEffect(() => {
    if (!showPartMenu) return
    const onDown = (e) => {
      if (!partMenuRef.current?.contains(e.target)) setShowPartMenu(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [showPartMenu])

  const collectedItems = useMemo(
    () => (event.rewardItemIds || []).map((id) => ALL_ITEMS[id]).filter(Boolean),
    [event],
  )
  const messageText = event.dialogue || event.narration
  const messageKind = event.dialogue ? 'dialogue' : 'narration'

  // App.jsx 已经做了「只往前」的处理，这里只负责通知。
  useEffect(() => {
    onProgress?.(location.id, eventIndex)
  }, [eventIndex, location.id, onProgress])

  const handleInteract = () => {
    if (interacted) return
    setInteractedSet((s) => {
      const next = new Set(s)
      next.add(eventIndex)
      return next
    })
    ;(event.rewardItemIds || []).forEach((id) => onCollectItem?.(id))
    ;(event.unlockPhotoGroupIds || []).forEach((id) => onUnlockPhotoGroup?.(id))
  }

  const scrollUp = () => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleContinue = () => {
    if (isLast) {
      onComplete?.(location.id)
      return
    }
    setEventIndex((i) => i + 1)
    scrollUp()
  }

  const handlePrev = () => {
    if (isFirst) return
    setEventIndex((i) => i - 1)
    scrollUp()
  }

  // 「从头再看」：保留所有已读状态，只回到第 1 段。一路按继续就是浏览。
  const handleRestart = () => {
    setEventIndex(0)
    scrollUp()
  }

  // 「重新体验」：清空互动记录，让每个事件再次需要互动；纪念品/相片集已经收过的不会重复发放。
  const handleReplayFresh = () => {
    setInteractedSet(new Set())
    setEventIndex(0)
    scrollUp()
  }

  const handleJumpToPart = (eventIdx) => {
    setEventIndex(eventIdx)
    setShowPartMenu(false)
    scrollUp()
  }

  // 上传一张新的场景照片
  const handleSceneAdd = async (file) => {
    if (!file) return
    const newKey =
      sceneUploadCount === 0
        ? `scene:${event.id}`
        : `scene:${event.id}:${Date.now()}`
    setSceneError(null)
    setSceneBusy(true)
    try {
      await onUpload?.(newKey, file)
      // 让轮播自动停到新加的那张：场景类卡片排在最前面，新增的会出现在场景段末尾，
      // 所以索引等于「上传前的场景张数」。
      setSceneIndex(sceneUploadCount)
    } catch (err) {
      setSceneError(err?.message || '上传失败')
    } finally {
      setSceneBusy(false)
    }
  }

  // 删除当前展示张：只允许对「上传过的」卡片删除，自带（数据文件 imageUrl）的不动。
  const handleRemoveCurrent = async () => {
    if (!currentSlot?.isUpload) return
    setSceneError(null)
    try {
      await onRemoveUpload?.(currentSlot.id)
    } catch (err) {
      setSceneError(err?.message || '移除失败')
    }
  }

  const handleScenePrev = () => setSceneIndex((i) => Math.max(0, i - 1))
  const handleSceneNext = () => setSceneIndex((i) => Math.min(slotCount - 1, i + 1))

  // 进度条：取「眼下事件」与「读过最远位置」的较大值
  const farthestSeen = Math.max(eventIndex, ...interactedSet, -1)
  const progressBase = Math.max(eventIndex, farthestSeen)
  const progressPct = Math.round(((progressBase + (interacted ? 1 : 0.5)) / totalEvents) * 100)

  const partTransition =
    eventIndex > 0 &&
    location.events[eventIndex - 1].partId !== event.partId

  return (
    <div className="min-h-full flex flex-col pb-10">
      {/* 顶部 */}
      <header className="px-4 sm:px-8 pt-5 pb-3 sticky top-0 z-30 bg-paper/90 backdrop-blur border-b border-beige-200">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn !py-2 !px-3 text-sm">
            ← 回地图
          </button>
          <div className="flex-1 min-w-0 text-center">
            <h1 className="font-serif text-lg sm:text-xl font-semibold text-ink truncate">
              {location.emoji} {location.name}
              {isReplay && (
                <span className="ml-2 text-[10px] align-middle px-1.5 py-0.5 rounded bg-sage/40 border border-sage text-ink/70">
                  重温
                </span>
              )}
            </h1>
            {showParts && part && (
              <div className="text-[11px] sm:text-xs text-ink/60 truncate">
                段落 · <span className="italic">{part.name}</span>
              </div>
            )}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-ink/70 whitespace-nowrap">
            {eventIndex + 1} / {totalEvents}
          </div>
        </div>

        {/* 进度条 */}
        <div className="mt-2 h-2 rounded-full bg-beige-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sunny via-rose to-sage transition-all duration-500"
            style={{ width: `${Math.min(100, progressPct)}%` }}
          />
        </div>

        {/* 章节内导航 */}
        <div className="mt-2 flex items-center flex-wrap justify-between gap-2 max-w-2xl mx-auto">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className="btn !py-1.5 !px-3 text-xs disabled:opacity-40"
          >
            ← 上一段
          </button>

          <div className="flex items-center flex-wrap gap-2">
            {/* 段落跳转 */}
            {showParts && partChips.length > 1 && (
              <div ref={partMenuRef} className="relative">
                <button
                  onClick={() => setShowPartMenu((s) => !s)}
                  className="btn !py-1.5 !px-3 text-xs"
                >
                  📍 段落 ▾
                </button>
                {showPartMenu && (
                  <div className="absolute right-0 top-full mt-1 w-72 max-w-[88vw] bg-white rounded-2xl border border-beige-200 shadow-soft z-40 max-h-80 overflow-y-auto p-1">
                    {partChips.map((p, i) => {
                      const active = part?.name === p.name
                      return (
                        <button
                          key={`${p.firstEventIdx}-${p.name}`}
                          onClick={() => handleJumpToPart(p.firstEventIdx)}
                          className={`w-full text-left p-2 rounded-xl hover:bg-beige-100 transition ${active ? 'bg-sage/30' : ''}`}
                        >
                          <div className="text-[10px] text-ink/50">
                            第 {i + 1} 段 · 事件 {p.firstEventIdx + 1}
                          </div>
                          <div className="font-semibold text-sm truncate">{p.name}</div>
                          <div className="text-xs text-ink/55 truncate">
                            → {p.firstEvent.title}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleRestart}
              disabled={isFirst}
              className="btn !py-1.5 !px-3 text-xs disabled:opacity-40"
              title="保留已读状态，只回到第 1 段"
            >
              🔄 从头再看
            </button>

            {/* 仅在已完成的章节里显示「重新体验」 */}
            {isReplay && (
              <button
                onClick={handleReplayFresh}
                className="btn !py-1.5 !px-3 text-xs bg-sunny/60 hover:bg-sunny border-sunny"
                title="清空互动记录，每段都重新点一次"
              >
                🎮 重新体验
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 段落切换提示 */}
      {partTransition && showParts && (
        <div className="px-4 sm:px-8 mt-3">
          <div className="card max-w-2xl mx-auto text-center animate-pop bg-rose/30 border-rose">
            <div className="text-xs tracking-widest text-ink/60">进入新段落</div>
            <div className="font-serif text-base font-semibold mt-0.5">{part.name}</div>
          </div>
        </div>
      )}

      {/* 场景 */}
      <div className="flex-1 px-4 sm:px-8 py-5 flex flex-col items-center">
        <div className="card paper-grain w-full max-w-2xl text-center relative">
          <div className="text-xs tracking-widest text-ink/50">
            🕒 {event.time}
          </div>
          <h2 className="font-serif text-lg sm:text-xl font-semibold mt-1">
            {event.title}
          </h2>
          {event.scene && (
            <div className="text-xs text-ink/50 italic mt-0.5">— {event.scene}</div>
          )}

          {/* 场景画面 */}
          <div
            className={`mt-5 mb-2 relative h-52 sm:h-64 rounded-2xl border border-beige-200 overflow-hidden bg-gradient-to-br ${event.sceneGradient || 'from-amber-200 via-rose-200 to-orange-200'}`}
          >
            {sceneSrc ? (
              <img
                src={sceneSrc}
                alt={currentSlot?.title || event.scene || event.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 text-5xl opacity-60 select-none">
                {event.sceneEmoji || '✨'}
              </div>
            )}

            {/* 互动贴纸 —— 已互动 或 已经有任意可见照片 时隐藏，让真实照片完整显示 */}
            {!interacted && !hasScenePhoto && (
              <>
                <button
                  onClick={handleInteract}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                    w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/85 border-4 border-beige-200
                    shadow-sticker text-5xl sm:text-6xl flex items-center justify-center
                    animate-floaty hover:scale-110 transition"
                  aria-label={`与${event.interactable.label}互动`}
                >
                  {event.interactable.emoji}
                </button>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-white/90 px-2 py-0.5 rounded-md border border-beige-200 whitespace-nowrap">
                  点一下{event.interactable.label}
                </span>
              </>
            )}

            {/* 右上角徽章：你的照片 / 相片集 + 计数 */}
            {hasScenePhoto && (
              <span
                className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-md border ${
                  currentSlot?.isUpload
                    ? 'bg-white/90 border-rose text-rose'
                    : 'bg-white/85 border-beige-200 text-ink/70'
                }`}
              >
                {currentSlot?.isUpload ? '你的照片' : '相片集'}
                {slotCount > 1 && ` ${safeSceneIndex + 1} / ${slotCount}`}
              </span>
            )}

            {/* 左右切换按钮（多张时才显示） */}
            {slotCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleScenePrev()
                  }}
                  disabled={safeSceneIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-beige-200 shadow-sticker text-lg disabled:opacity-30 hover:bg-white transition"
                  aria-label="上一张"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSceneNext()
                  }}
                  disabled={safeSceneIndex === slotCount - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-beige-200 shadow-sticker text-lg disabled:opacity-30 hover:bg-white transition"
                  aria-label="下一张"
                >
                  →
                </button>
                {/* 圆点指示 */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {eventPhotoSlots.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSceneIndex(i)
                      }}
                      className={`w-1.5 h-1.5 rounded-full ${i === safeSceneIndex ? 'bg-white' : 'bg-white/50'}`}
                      aria-label={`第 ${i + 1} 张`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 当前那张的标题（如果是相片集里的照片，给一句简短说明） */}
          {currentSlot?.kind === 'group' && (currentSlot.title || currentSlot.caption) && (
            <div className="mb-2 text-xs text-ink/60">
              <span className="font-semibold">{currentSlot.title}</span>
              {currentSlot.caption && (
                <span className="ml-1 italic">— {currentSlot.caption}</span>
              )}
            </div>
          )}

          {/* 上传 / 删除控制 */}
          <div className="flex flex-wrap justify-center items-center gap-2 mb-3">
            <input
              ref={sceneFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleSceneAdd(f)
                e.target.value = ''
              }}
            />
            <button
              className="btn !py-1.5 !px-3 text-xs"
              onClick={() => sceneFileRef.current?.click()}
              disabled={sceneBusy}
            >
              {sceneBusy
                ? '处理中…'
                : sceneUploadCount > 0
                ? '📷 再加一张'
                : '📷 上传当时的照片'}
            </button>
            {currentSlot?.isUpload && (
              <button
                className="btn !py-1.5 !px-3 text-xs bg-rose/30 border-rose"
                onClick={handleRemoveCurrent}
                disabled={sceneBusy}
              >
                🗑️ 移除这张
              </button>
            )}
          </div>
          {sceneError && (
            <div className="mb-3 px-3 py-1.5 rounded-md bg-rose/30 border border-rose text-xs text-ink mx-auto inline-block">
              ⚠️ {sceneError}
            </div>
          )}

          {/* 互动前：动作按钮 */}
          {!interacted && (
            <div className="flex justify-center">
              <button className="btn-primary" onClick={handleInteract}>
                ✨ {event.actionButtonText || `与${event.interactable.label}互动`}
              </button>
            </div>
          )}

          {/* 互动后：旁白 / 对话 + 通知 + 继续 */}
          {interacted && (
            <div className="space-y-3 animate-fadeIn">
              <DialogBox kind={messageKind} text={messageText} />

              {/* 纪念品通知 */}
              {collectedItems.map((it) => (
                <div
                  key={it.id}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-sage/40 border border-sage rounded-full text-sm animate-pop"
                >
                  <span className="text-xl">{it.emoji}</span>
                  <span>
                    获得纪念品：<b>{it.name}</b>
                  </span>
                </div>
              ))}

              {/* 相片集通知（点开可上传 / 替换 / 删除任一张） */}
              {unlockedGroups.length > 0 && (
                <div className="space-y-1">
                  {unlockedGroups.map((g) => {
                    const uploadedInGroup = g.photos.filter((p) => uploads[p.id]).length
                    return (
                      <button
                        key={g.id}
                        onClick={() => setOpenGroupId(g.id)}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-rose/40 border border-rose rounded-full text-sm animate-pop hover:bg-rose/60 transition"
                      >
                        <span className="text-xl">📸</span>
                        <span>
                          解锁相片集：<b>{g.title}</b>
                          <span className="ml-1 text-ink/60">
                            （共 {g.photos.length} 张{uploadedInGroup > 0 && `．已上传 ${uploadedInGroup}`}）
                          </span>
                        </span>
                        <span className="text-xs text-ink/60">点开管理 →</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* 最终事件结语 */}
              {isLast && event.endingText && (
                <div className="card bg-beige-100 border-beige-200 text-left mt-2">
                  <div className="text-xs tracking-widest text-ink/50 mb-1">
                    🌧️ 章节尾声
                  </div>
                  <p className="font-serif italic text-ink/85 leading-relaxed whitespace-pre-line">
                    {event.endingText}
                  </p>
                </div>
              )}

              {/* 继续 / 结束 */}
              <div className="pt-1 flex justify-center">
                <button className="btn-primary" onClick={handleContinue}>
                  {isLast ? '🌸 结束回忆' : '继续回忆 →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 相片集弹窗（在回忆页里直接管理上传） */}
      {openGroupId && (
        <PhotoGroupModal
          group={enrichedGroups[openGroupId]}
          uploads={uploads}
          onUpload={onUpload}
          onRemoveUpload={onRemoveUpload}
          onClose={() => setOpenGroupId(null)}
        />
      )}
    </div>
  )
}
