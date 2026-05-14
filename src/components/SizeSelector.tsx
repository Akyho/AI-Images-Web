import { useState } from 'react'
import { useImageStore } from '@/store/useImageStore'
import { Ruler, X, Plus, Trash2 } from 'lucide-react'

interface SizeSelectorProps {
  value: string
  onChange: (value: string) => void
}

const PRESET_OPTIONS = [
  { label: '1024×1024', value: '1024x1024' },
  { label: '1024×1536', value: '1024x1536' },
  { label: '1536×1024', value: '1536x1024' },
]

const BUILTIN_CUSTOM_PRESETS = [
  { label: '512×512', value: '512x512' },
  { label: '768×768', value: '768x768' },
  { label: '512×768', value: '512x768' },
  { label: '768×512', value: '768x512' },
  { label: '1792×1024', value: '1792x1024' },
  { label: '1024×1792', value: '1024x1792' },
]

function isValidSize(size: string): boolean {
  return /^\d+x\d+$/.test(size)
}

function sizeLabel(value: string): string {
  return value.replace('x', '×')
}

function sortByArea(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const [aw, ah] = a.split('x').map(Number)
    const [bw, bh] = b.split('x').map(Number)
    const areaDiff = aw * ah - bw * bh
    if (areaDiff !== 0) return areaDiff
    return aw - bw
  })
}

export default function SizeSelector({ value, onChange }: SizeSelectorProps) {
  const config = useImageStore((s) => s.config)
  const setConfig = useImageStore((s) => s.setConfig)
  const [customOpen, setCustomOpen] = useState(false)
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')

  const allCustomPresets = [...BUILTIN_CUSTOM_PRESETS.map((p) => p.value), ...config.customSizePresets]

  const isCustom = !PRESET_OPTIONS.some((opt) => opt.value === value)

  const handlePresetClick = (size: string) => {
    onChange(size)
    const [w, h] = size.split('x')
    setCustomWidth(w)
    setCustomHeight(h)
  }

  const handleCustomApply = () => {
    const w = customWidth.trim()
    const h = customHeight.trim()
    const size = `${w}x${h}`
    if (w && h && isValidSize(size)) {
      onChange(size)
      setCustomOpen(false)
    }
  }

  const handleSavePreset = () => {
    const w = customWidth.trim()
    const h = customHeight.trim()
    const size = `${w}x${h}`
    if (!w || !h || !isValidSize(size)) return
    if (allCustomPresets.includes(size)) return
    setConfig({ customSizePresets: [...config.customSizePresets, size] })
  }

  const handleDeletePreset = (size: string) => {
    setConfig({ customSizePresets: config.customSizePresets.filter((s) => s !== size) })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-surface-200">图片尺寸</label>
        <span className="text-[10px] text-surface-500">需模型支持</span>
      </div>

      <div className="flex gap-2 sm:gap-3 flex-wrap">
        {PRESET_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-mono transition-all duration-300 ${
              value === opt.value
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40'
                : 'bg-surface-800/80 text-surface-400 border border-surface-700/50 hover:border-brand-500/20'
            }`}
          >
            {opt.label}
          </button>
        ))}

        <button
          onClick={() => setCustomOpen(!customOpen)}
          className={`flex items-center gap-1 px-3 sm:px-4 py-2 rounded-xl text-xs font-mono transition-all duration-300 ${
            isCustom || customOpen
              ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40'
              : 'bg-surface-800/80 text-surface-400 border border-surface-700/50 hover:border-brand-500/20'
          }`}
        >
          <Ruler className="w-3 h-3" />
          自定义
        </button>
      </div>

      {customOpen && (
        <div className="glass-card p-4 space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-surface-300">自定义尺寸</span>
            <button
              onClick={() => setCustomOpen(false)}
              className="p-1 rounded-lg hover:bg-surface-700/50 text-surface-400 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] text-surface-500">宽度</label>
              <input
                type="number"
                min={1}
                max={4096}
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                placeholder="1024"
                className="input-field font-mono text-xs"
              />
            </div>
            <div className="flex items-end pb-3 text-surface-500 text-sm">×</div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] text-surface-500">高度</label>
              <input
                type="number"
                min={1}
                max={4096}
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                placeholder="1024"
                className="input-field font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCustomApply}
              disabled={!customWidth || !customHeight}
              className="btn-primary flex-1 text-sm py-2"
            >
              应用 {customWidth && customHeight ? `${customWidth}×${customHeight}` : ''}
            </button>
            <button
              onClick={handleSavePreset}
              disabled={!customWidth || !customHeight || allCustomPresets.includes(`${customWidth.trim()}x${customHeight.trim()}`)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 transition-colors text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              title={allCustomPresets.includes(`${customWidth.trim()}x${customHeight.trim()}`) ? '已存在' : '保存为预设'}
            >
              <Plus className="w-3.5 h-3.5" />
              保存
            </button>
          </div>

          <div className="pt-2 border-t border-surface-700/30">
            <p className="text-[10px] text-surface-500 mb-2">常用自定义</p>
            <div className="flex gap-2 flex-wrap">
              {sortByArea(BUILTIN_CUSTOM_PRESETS.map((p) => p.value)).map((val) => {
                const opt = BUILTIN_CUSTOM_PRESETS.find((p) => p.value === val)!
                return (
                  <button
                    key={opt.value}
                    onClick={() => handlePresetClick(opt.value)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                      value === opt.value
                        ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                        : 'bg-surface-900/80 text-surface-400 border border-surface-700/30 hover:border-brand-500/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
              {sortByArea(config.customSizePresets).map((size) => (
                <div key={size} className="flex items-center gap-0.5">
                  <button
                    onClick={() => handlePresetClick(size)}
                    className={`px-2.5 py-1.5 rounded-l-lg text-[11px] font-mono transition-all ${
                      value === size
                        ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30 border-r-0'
                        : 'bg-surface-900/80 text-surface-400 border border-surface-700/30 border-r-0 hover:border-brand-500/20'
                    }`}
                  >
                    {sizeLabel(size)}
                  </button>
                  <button
                    onClick={() => handleDeletePreset(size)}
                    className={`px-1.5 py-1.5 rounded-r-lg transition-colors ${
                      value === size
                        ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30 border-l-0 hover:bg-red-500/20 hover:text-red-400'
                        : 'bg-surface-900/80 text-surface-500 border border-surface-700/30 border-l-0 hover:bg-red-500/20 hover:text-red-400'
                    }`}
                    title="删除预设"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isCustom && !customOpen && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-400 font-mono">{sizeLabel(value)}</span>
          <button
            onClick={() => onChange('1024x1024')}
            className="text-[10px] text-surface-500 hover:text-red-400 transition-colors"
          >
            重置
          </button>
        </div>
      )}
    </div>
  )
}
