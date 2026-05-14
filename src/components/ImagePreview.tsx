import { useEffect } from 'react'
import { useImageStore } from '@/store/useImageStore'
import { downloadImage } from '@/utils/download'
import { useImageZoom } from '@/hooks/useImageZoom'
import SafeImage from '@/components/SafeImage'
import { X, Download, ZoomIn, ZoomOut, RotateCcw, Sparkles, Pencil } from 'lucide-react'

export default function ImagePreview() {
  const { previewImage, setPreviewImage } = useImageStore()
  const {
    zoom, setZoom,
    panX, panY,
    dragging,
    clampZoom,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetView,
  } = useImageZoom()

  useEffect(() => {
    if (previewImage) {
      resetView()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [previewImage, resetView])

  if (!previewImage) return null

  const handleDownload = () => {
    downloadImage(previewImage.imageUrl, `ai-image-${previewImage.id.slice(0, 8)}.png`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-surface-950/95 backdrop-blur-sm animate-fade-in select-none"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700/30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {previewImage.type === 'generation' ? (
              <Sparkles className="w-4 h-4 text-brand-400" />
            ) : (
              <Pencil className="w-4 h-4 text-purple-400" />
            )}
            <span className="text-xs text-surface-400">
              {previewImage.type === 'generation' ? 'AI 生成' : 'AI 编辑'}
              {previewImage.size && ` · ${previewImage.size}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom((prev) => clampZoom(prev - 10))}
              disabled={zoom <= 10}
              className="p-1 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-surface-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={zoom}
              onChange={(e) => setZoom(clampZoom(Number(e.target.value)))}
              className="w-28 accent-purple-500"
            />
            <button
              onClick={() => setZoom((prev) => clampZoom(prev + 10))}
              disabled={zoom >= 500}
              className="p-1 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-surface-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs text-surface-500 font-mono w-11 text-right">
              {zoom}%
            </span>
          </div>
          <button
            onClick={resetView}
            className="flex items-center gap-1 text-xs text-surface-500 hover:text-brand-400 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            重置
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 transition-colors text-xs"
          >
            <Download className="w-3 h-3" />
            下载
          </button>
          <button
            onClick={() => setPreviewImage(null)}
            className="p-1.5 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-surface-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-hidden relative"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={resetView}
        style={{ cursor: dragging ? 'grabbing' : zoom > 100 ? 'grab' : 'default' }}
      >
        <SafeImage
          src={previewImage.imageUrl}
          alt={previewImage.prompt}
          className="absolute left-1/2 top-1/2 max-w-none pointer-events-none"
          style={{
            transform: `translate(-50%, -50%) scale(${zoom / 100}) translate(${panX}px, ${panY}px)`,
            transformOrigin: 'center center',
          }}
          draggable={false}
        />
      </div>

      <div className="flex items-center justify-center gap-2 py-2 border-t border-surface-700/30 flex-shrink-0">
        <span className="text-xs text-surface-500 leading-relaxed max-w-4xl px-4 truncate">
          {previewImage.prompt}
        </span>
        <span className="text-[10px] text-surface-600">|</span>
        <span className="text-[10px] text-surface-500">滚轮缩放 / 拖拽移动 / 双击重置</span>
        <span className="text-[10px] text-surface-600">|</span>
        <span className="text-[10px] text-surface-500">缩放: {zoom}%</span>
      </div>
    </div>
  )
}
