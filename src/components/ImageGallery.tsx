import { useState } from 'react'
import { useImageStore } from '@/store/useImageStore'
import type { ImageRecord } from '@/store/useImageStore'
import JSZip from 'jszip'
import { downloadImage } from '@/utils/download'
import CompareView from '@/components/CompareView'
import { Trash2, Sparkles, Package, Check, X, Grid3X3, Columns2, Download, Expand, FileText } from 'lucide-react'
import SafeImage from '@/components/SafeImage'

const COLUMN_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9] as const

export default function ImageGallery() {
  const { images, config, setConfig, removeImage, clearImages, setPreviewImage } = useImageStore()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [packaging, setPackaging] = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false)
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === images.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(images.map((img) => img.id)))
    }
  }

  const handleDownload = (image: ImageRecord) => {
    downloadImage(image.imageUrl, `ai-image-${image.id.slice(0, 8)}.png`)
  }

  const handleBatchDownload = async () => {
    if (selectedIds.size === 0) return
    setPackaging(true)
    try {
      const zip = new JSZip()
      const selectedImages = images.filter((img) => selectedIds.has(img.id))
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i]
        try {
          const response = await fetch(image.imageUrl)
          const blob = await response.blob()
          const ext = blob.type.includes('png') ? 'png' : blob.type.includes('jpg') || blob.type.includes('jpeg') ? 'jpg' : 'png'
          zip.file(`ai-image-${String(i + 1).padStart(3, '0')}.${ext}`, blob)
        } catch {
          // skip failed downloads
        }
      }
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-images-${selectedImages.length}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setPackaging(false)
      setSelectedIds(new Set())
    }
  }

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return
    selectedIds.forEach((id) => removeImage(id))
    setSelectedIds(new Set())
    setBatchDeleteConfirm(false)
  }

  const handleExportPrompts = () => {
    if (selectedIds.size === 0) return
    const selectedImages = images.filter((img) => selectedIds.has(img.id))
    const lines = selectedImages.map((img) => {
      const time = new Date(img.createdAt).toLocaleString('zh-CN')
      const filename = `ai-image-${img.id.slice(0, 8)}.png`
      return [
        `--- ${filename} ---`,
        `类型: ${img.type === 'generation' ? 'AI 生成' : 'AI 编辑'}`,
        `模型: ${img.modelId || '未知'}`,
        `时间: ${time}`,
        ...(img.size ? [`尺寸: ${img.size}`] : []),
        `提示词: ${img.prompt}`,
        '',
      ].join('\n')
    }).join('\n')
    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const now = new Date()
    const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
    a.download = `ai-prompts-${selectedImages.length}-${ts}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-surface-500">
        <Sparkles className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-sm">还没有生成图片</p>
        <p className="text-xs mt-1 text-surface-600">使用上方的功能生成或编辑图片</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-surface-300">
            生成结果 ({images.length})
          </h3>
          <button
            onClick={selectAll}
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            {selectedIds.size === images.length ? '取消全选' : '全选'}
          </button>
          <button
            onClick={() =>
              setSelectedIds(
                new Set(images.filter((img) => !selectedIds.has(img.id)).map((img) => img.id))
              )
            }
            className="text-xs text-surface-500 hover:text-brand-400 transition-colors"
          >
            反选
          </button>
          {selectedIds.size > 0 && (
            <span className="text-xs text-surface-500">
              已选 <span className="text-brand-400 font-mono">{selectedIds.size}</span> 张
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              {selectedIds.size >= 2 && selectedIds.size <= 9 && (
                <button
                  onClick={() => setCompareOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors text-xs"
                >
                  <Columns2 className="w-3 h-3" />
                  对比
                </button>
              )}
              <button
                onClick={handleBatchDownload}
                disabled={packaging}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 transition-colors text-xs"
              >
                {packaging ? (
                  <>
                    <Sparkles className="w-3 h-3 animate-spin" />
                    打包中...
                  </>
                ) : (
                  <>
                    <Package className="w-3 h-3" />
                    打包下载
                  </>
                )}
              </button>
              <button
                onClick={handleExportPrompts}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors text-xs"
              >
                <FileText className="w-3 h-3" />
                导出提示词
              </button>
              {batchDeleteConfirm ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-red-400">确认删除 {selectedIds.size} 张？</span>
                  <button
                    onClick={handleDeleteSelected}
                    className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition-colors"
                  >
                    确认
                  </button>
                  <button
                    onClick={() => setBatchDeleteConfirm(false)}
                    className="px-2 py-0.5 rounded bg-surface-700/50 text-surface-400 text-xs hover:bg-surface-600/50 transition-colors"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setBatchDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-xs"
                >
                  <Trash2 className="w-3 h-3" />
                  删除
                </button>
              )}
              <button
                onClick={() => setSelectedIds(new Set())}
                className="p-1.5 rounded-lg hover:bg-surface-700/50 text-surface-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          {!selectedIds.size && (
            <>
              <div className="relative">
                <button
                  onClick={() => setColumnsOpen(!columnsOpen)}
                  className="flex items-center gap-1 text-xs text-surface-500 hover:text-brand-400 transition-colors"
                >
                  <Grid3X3 className="w-3 h-3" />
                  {config.galleryColumns}列
                </button>
                {columnsOpen && (
                  <div className="absolute top-8 right-0 glass-card p-1.5 rounded-xl z-20 flex gap-1">
                    {COLUMN_OPTIONS.map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          setConfig({ galleryColumns: n })
                          setColumnsOpen(false)
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                          config.galleryColumns === n
                            ? 'bg-brand-500/20 text-brand-400'
                            : 'text-surface-400 hover:bg-surface-700/50'
                        }`}
                      >
                        {n}列
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {clearConfirm ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-red-400">确认清空？</span>
                  <button
                    onClick={() => {
                      clearImages()
                      setClearConfirm(false)
                    }}
                    className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition-colors"
                  >
                    清空
                  </button>
                  <button
                    onClick={() => setClearConfirm(false)}
                    className="px-2 py-0.5 rounded bg-surface-700/50 text-surface-400 text-xs hover:bg-surface-600/50 transition-colors"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setClearConfirm(true)}
                  className="text-xs text-surface-500 hover:text-red-400 transition-colors"
                >
                  清空全部
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div
        className={`grid gap-4`}
        style={{ gridTemplateColumns: `repeat(${config.galleryColumns}, minmax(0, 1fr))` }}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`group relative glass-card overflow-hidden animate-slide-up cursor-pointer ${
              selectedIds.has(image.id) ? 'ring-2 ring-brand-500' : ''
            }`}
            style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
            onClick={() => toggleSelect(image.id)}
          >
            <div className="aspect-square overflow-hidden">
              <SafeImage
                src={image.imageUrl}
                alt={image.prompt}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute top-2 left-2">
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  selectedIds.has(image.id)
                    ? 'bg-brand-500 border-brand-500'
                    : 'bg-surface-900/60 border-surface-500/50 group-hover:border-brand-500/50'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSelect(image.id)
                }}
              >
                {selectedIds.has(image.id) && <Check className="w-3 h-3 text-surface-900" />}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-center gap-1">
                <button
                  onClick={() => setPreviewImage(image)}
                  className="p-1 rounded-md bg-surface-800/80 text-surface-300 hover:text-brand-400 transition-colors"
                  title="查看大图"
                >
                  <Expand className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDownload(image)}
                  className="p-1 rounded-md bg-surface-800/80 text-surface-300 hover:text-brand-400 transition-colors"
                  title="下载"
                >
                  <Download className="w-3 h-3" />
                </button>
                {deleteConfirmId === image.id ? (
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(image.id)
                        setDeleteConfirmId(null)
                      }}
                      className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] hover:bg-red-500/30 transition-colors"
                    >
                      确认
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteConfirmId(null)
                      }}
                      className="px-1.5 py-0.5 rounded bg-surface-700/50 text-surface-400 text-[10px] hover:bg-surface-600/50 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(image.id)}
                    className="p-1 rounded-md bg-surface-800/80 text-surface-300 hover:text-red-400 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {compareOpen && (
        <CompareView
          images={Array.from(selectedIds).map((id) => images.find((img) => img.id === id)!).filter(Boolean)}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </div>
  )
}
