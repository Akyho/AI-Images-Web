import { useState, useRef, useCallback } from 'react'
import { useImageStore } from '@/store/useImageStore'
import { editImage, getImageSrc } from '@/utils/api'
import SizeSelector from '@/components/SizeSelector'
import { Pencil, Upload, Loader2, X } from 'lucide-react'
import SafeImage from '@/components/SafeImage'

interface TaskResult {
  success: boolean
  imageUrl?: string
  error?: string
}

export default function EditTab() {
  const { config, addImageWithCache, loading, setLoading } = useImageStore()
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState('1024x1024')
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [count, setCount] = useState(1)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const abortRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }
    setImageFile(file)
    setError('')
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const clearImage = () => {
    setImageFile(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const runEditTask = useCallback(async (
    file: File,
    editPrompt: string,
    editSize: string,
    n: number,
    signal?: AbortSignal
  ): Promise<TaskResult[]> => {
    try {
      const result = await editImage(config, file, editPrompt, editSize, n, signal)
      const taskResults: TaskResult[] = []
      for (const item of result.data) {
        const imageUrl = getImageSrc(item)
        if (imageUrl) {
          addImageWithCache({
            id: crypto.randomUUID(),
            type: 'edit',
            prompt: editPrompt,
            imageUrl,
            createdAt: Date.now(),
            size: editSize,
            modelId: config.modelId,
          })
          taskResults.push({ success: true, imageUrl })
        }
      }
      if (taskResults.length === 0) {
        return [{ success: false, error: '未返回图片' }]
      }
      return taskResults
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return [{ success: false, error: '已取消' }]
      }
      return [{
        success: false,
        error: err instanceof Error ? err.message : '编辑失败',
      }]
    }
  }, [config, addImageWithCache])

  const handleEdit = async () => {
    if (!prompt.trim() || !imageFile) return
    if (!config.apiKey) {
      setError('请先填写 API Key')
      return
    }
    if (count < 1) {
      setError('生成数量至少为 1')
      return
    }

    setError('')
    setLoading(true)
    abortRef.current = false
    abortControllerRef.current = new AbortController()
    setProgress({ current: 0, total: count })

    const targetFile = imageFile
    const editPrompt = prompt.trim()
    const editSize = size
    let generated = 0
    const results: TaskResult[] = []

    try {
      while (generated < count && !abortRef.current) {
        const n = Math.min(count - generated, 1)
        const taskResults = await runEditTask(targetFile, editPrompt, editSize, n, abortControllerRef.current?.signal)
        if (abortRef.current) break
        results.push(...taskResults)
        const delta = taskResults.filter((r) => r.success).length
        generated += delta
        setProgress({ current: generated, total: count })
        if (delta === 0) break
      }

      const failedCount = results.filter((r) => !r.success).length
      if (failedCount > 0 && failedCount === results.length) {
        const firstError = results.find((r) => r.error)?.error
        setError(firstError || '全部编辑失败')
      } else if (failedCount > 0) {
        setError(`${failedCount} 张图片编辑失败`)
      }

      if (results.some((r) => r.success)) {
        setPrompt('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '编辑失败')
    } finally {
      setLoading(false)
      setProgress({ current: 0, total: 0 })
      abortRef.current = false
      abortControllerRef.current = null
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-surface-200">
          <Upload className="w-4 h-4 text-brand-400" />
          上传图片
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileSelect(file)
          }}
          className="hidden"
        />
        {imagePreview ? (
          <div className="relative group rounded-xl overflow-hidden border border-surface-700/50">
            <SafeImage
              src={imagePreview}
              alt="上传预览"
              className="w-full max-h-64 object-contain bg-surface-900/50"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-surface-900/80 text-surface-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 py-10 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
              isDragging
                ? 'border-brand-500/60 bg-brand-500/5'
                : 'border-surface-700/50 bg-surface-900/30 hover:border-brand-500/30 hover:bg-surface-900/50'
            }`}
          >
            <Upload className="w-8 h-8 text-surface-500" />
            <div className="text-center">
              <p className="text-sm text-surface-400">
                拖拽图片到此处或{' '}
                <span className="text-brand-400">点击上传</span>
              </p>
              <p className="text-xs text-surface-600 mt-1">
                支持 PNG, JPG, WEBP
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-surface-200">
          <Pencil className="w-4 h-4 text-brand-400" />
          编辑提示词
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述你想要的编辑效果..."
          rows={3}
          className="input-field resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleEdit()
            }
          }}
        />
      </div>

      <SizeSelector value={size} onChange={setSize} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-surface-200">生成数量</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={500}
            value={Math.min(count, 500)}
            onChange={(e) => setCount(Number(e.target.value))}
            className="flex-1 accent-brand-500"
          />
          <input
            type="number"
            min={1}
            max={9999}
            value={count}
            onChange={(e) => {
              const v = Number(e.target.value)
              setCount(v < 1 ? 1 : v > 9999 ? 9999 : Math.round(v))
            }}
            className="input-field w-20 text-center font-mono text-xs"
          />
        </div>
      </div>

      {progress.total > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-surface-400">生成进度</span>
            <span className="text-surface-500 font-mono">{progress.current}/{progress.total}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-up">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleEdit}
          disabled={loading || !prompt.trim() || !imageFile}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              编辑中 {progress.total > 0 && `(${progress.current}/${progress.total})`}...
            </>
          ) : (
            <>
              <Pencil className="w-4 h-4" />
              编辑图片 × {count}
            </>
          )}
        </button>
        {loading && (
          <button
            onClick={() => {
              abortRef.current = true
              abortControllerRef.current?.abort()
            }}
            className="btn-secondary flex items-center justify-center gap-1.5 px-4 whitespace-nowrap"
          >
            <X className="w-4 h-4" />
            取消
          </button>
        )}
      </div>
    </div>
  )
}
