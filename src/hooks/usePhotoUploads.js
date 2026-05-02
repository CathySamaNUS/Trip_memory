import { useCallback, useEffect, useState } from 'react'
import { getAllPhotos, setPhoto, deletePhoto } from '../lib/photoStore.js'
import { fileToCompressedDataUrl } from '../lib/imageUtils.js'

// 全局唯一的「上传照片」状态钩子。
// uploads: { [photoId]: dataURL } —— 用来覆盖数据文件里的 imageUrl。
export function usePhotoUploads() {
  const [uploads, setUploads] = useState({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    getAllPhotos()
      .then((p) => {
        if (alive) {
          setUploads(p)
          setReady(true)
        }
      })
      .catch(() => {
        if (alive) setReady(true)
      })
    return () => {
      alive = false
    }
  }, [])

  const uploadFile = useCallback(async (id, file) => {
    const dataUrl = await fileToCompressedDataUrl(file)
    await setPhoto(id, dataUrl)
    setUploads((u) => ({ ...u, [id]: dataUrl }))
    return dataUrl
  }, [])

  const removeUpload = useCallback(async (id) => {
    await deletePhoto(id)
    setUploads((u) => {
      const next = { ...u }
      delete next[id]
      return next
    })
  }, [])

  return { uploads, ready, uploadFile, removeUpload }
}
