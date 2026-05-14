import type { ImageRecord } from '@/store/useImageStore'
import { useImageZoom } from '@/hooks/useImageZoom'
import SafeImage from '@/components/SafeImage'
import { X, ZoomIn, ZoomOut, Sparkles, Pencil, RotateCcw } from 'lucide-react'

interface CompareViewProps {
  images: ImageRecord[]
  onClose: () => void
}

function getGridCols(count: number): number {
  if (count <= 1) return 1
  if (count === 2) return 2
  if (count <= 4) return 2
  return 3
}

export default function CompareView({ images, onClose }: CompareViewProps) {
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

  const gridCols = getGridCols(images.length)

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-surface-950/95 backdrop-blur-sm animate-fade-in select-none"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700/30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-surface-300">
            图片对比 ({images.length})
          </h3>
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
              className="w-32 accent-purple-500"
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
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-surface-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        className="grid gap-3 p-4 flex-1 overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          cursor: dragging ? 'grabbing' : zoom > 100 ? 'grab' : 'default',
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {images.map((image, index) => (
          <div key={image.id} className="flex flex-col glass-card overflow-hidden">
            <div className="flex-1 overflow-hidden relative">
              <SafeImage
                src={image.imageUrl}
                alt={image.prompt}
                className="absolute left-1/2 top-1/2 max-w-none pointer-events-none"
                style={{
                  transform: `translate(-50%, -50%) scale(${zoom / 100}) translate(${panX}px, ${panY}px)`,
                  transformOrigin: 'center center',
                }}
                draggable={false}
              />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 border-t border-surface-700/30 bg-surface-900/50 flex-shrink-0">
              <span className="text-[10px] text-purple-400 font-mono flex-shrink-0">
                #{index + 1}
              </span>
              {image.type === 'generation' ? (
                <Sparkles className="w-3 h-3 text-brand-400 flex-shrink-0" />
              ) : (
                <Pencil className="w-3 h-3 text-purple-400 flex-shrink-0" />
              )}
              <span className="text-[10px] text-surface-400 truncate">
                {image.prompt.slice(0, 60)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 py-2 border-t border-surface-700/30 flex-shrink-0">
        <span className="text-[10px] text-surface-500">滚轮缩放 / 拖拽移动</span>
        <span className="text-[10px] text-surface-600">|</span>
        <span className="text-[10px] text-surface-500">缩放: {zoom}%</span>
        {zoom > 100 && (
          <>
            <span className="text-[10px] text-surface-600">|</span>
            <button
              onClick={resetView}
              className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors"
            >
              重置视图
            </button>
          </>
        )}
      </div>
    </div>
  )
}
