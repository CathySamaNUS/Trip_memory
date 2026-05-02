import { useEffect, useState } from 'react'
import StartPage from './components/StartPage.jsx'
import MapPage from './components/MapPage.jsx'
import MemoryPage from './components/MemoryPage.jsx'
import InventoryPage from './components/InventoryPage.jsx'
import AlbumPage from './components/AlbumPage.jsx'
import { locations, STORAGE_KEY } from './data/travelData.js'
import { usePhotoUploads } from './hooks/usePhotoUploads.js'

const initialProgress = {
  completedLocationIds: [],
  collectedItemIds: [],
  unlockedPhotoGroupIds: [],
  chapterProgress: {}, // { [locationId]: eventIndex }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialProgress
    const parsed = JSON.parse(raw)
    return { ...initialProgress, ...parsed }
  } catch {
    return initialProgress
  }
}

const addUnique = (arr, value) => (arr.includes(value) ? arr : [...arr, value])

export default function App() {
  const [page, setPage] = useState('start') // start | map | memory | inventory | album
  const [activeLocationId, setActiveLocationId] = useState(null)
  const [progress, setProgress] = useState(loadProgress)
  const { uploads, uploadFile, removeUpload } = usePhotoUploads()

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      /* ignore */
    }
  }, [progress])

  const activeLocation = locations.find((l) => l.id === activeLocationId)
  const resumeIndex = activeLocationId
    ? progress.chapterProgress[activeLocationId] || 0
    : 0

  const collectItem = (id) =>
    setProgress((p) => ({ ...p, collectedItemIds: addUnique(p.collectedItemIds, id) }))

  const unlockPhotoGroup = (id) =>
    setProgress((p) => ({
      ...p,
      unlockedPhotoGroupIds: addUnique(p.unlockedPhotoGroupIds, id),
    }))

  // 只往前推进 —— 玩家在章节里返回上一段或「从头再看」时，不要把已经读到的进度倒回。
  const saveChapterIndex = (locId, index) =>
    setProgress((p) => {
      const current = p.chapterProgress[locId] || 0
      if (index <= current) return p
      return {
        ...p,
        chapterProgress: { ...p.chapterProgress, [locId]: index },
      }
    })

  const completeLocation = (locId) => {
    setProgress((p) => {
      const { [locId]: _drop, ...rest } = p.chapterProgress
      return {
        ...p,
        completedLocationIds: addUnique(p.completedLocationIds, locId),
        chapterProgress: rest,
      }
    })
    setActiveLocationId(null)
    setPage('map')
  }

  const goMap = () => setPage('map')
  const goHome = () => setPage('start')

  return (
    <div className="min-h-full">
      {page === 'start' && (
        <StartPage onStart={goMap} onAlbum={() => setPage('album')} />
      )}

      {page === 'map' && (
        <MapPage
          completed={progress.completedLocationIds}
          chapterProgress={progress.chapterProgress}
          onSelectLocation={(loc) => {
            if (!loc.events || loc.events.length === 0) return
            setActiveLocationId(loc.id)
            setPage('memory')
          }}
          onOpenInventory={() => setPage('inventory')}
          onOpenAlbum={() => setPage('album')}
          onHome={goHome}
        />
      )}

      {page === 'memory' && activeLocation && (
        <MemoryPage
          key={activeLocation.id}
          location={activeLocation}
          initialEventIndex={resumeIndex}
          isReplay={progress.completedLocationIds.includes(activeLocation.id)}
          uploads={uploads}
          onUpload={uploadFile}
          onRemoveUpload={removeUpload}
          onCollectItem={collectItem}
          onUnlockPhotoGroup={unlockPhotoGroup}
          onProgress={saveChapterIndex}
          onComplete={completeLocation}
          onBack={goMap}
        />
      )}

      {page === 'inventory' && (
        <InventoryPage
          collectedItemIds={progress.collectedItemIds}
          onBack={goMap}
        />
      )}

      {page === 'album' && (
        <AlbumPage
          unlockedPhotoGroupIds={progress.unlockedPhotoGroupIds}
          uploads={uploads}
          onUpload={uploadFile}
          onRemoveUpload={removeUpload}
          onBack={() => setPage(activeLocationId ? 'map' : 'start')}
        />
      )}
    </div>
  )
}
