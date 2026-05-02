// 把 File 对象压缩成 dataURL（默认最长边 1600px，JPEG 质量 0.85）。
// 这样一张照片大约几百 KB，几十张也能塞进 IndexedDB。

export async function fileToCompressedDataUrl(file, { maxDim = 1600, quality = 0.85 } = {}) {
  if (!file || !file.type?.startsWith('image/')) {
    throw new Error('请选择图片文件')
  }
  const bitmap = await loadBitmap(file)
  const { width, height } = bitmap
  const scale = Math.min(1, maxDim / Math.max(width, height))
  const w = Math.max(1, Math.round(width * scale))
  const h = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()
  return canvas.toDataURL('image/jpeg', quality)
}

async function loadBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file)
    } catch {
      /* fallback below */
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    img.src = url
  })
}
