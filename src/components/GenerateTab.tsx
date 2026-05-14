import { useState, useRef, useCallback } from 'react'
import { useImageStore } from '@/store/useImageStore'
import { generateImage, getImageSrc } from '@/utils/api'
import { PROMPT_TEMPLATES } from '@/utils/templates'
import SizeSelector from '@/components/SizeSelector'
import { Sparkles, Loader2, ImageIcon, ChevronDown, ChevronUp, X } from 'lucide-react'

interface TaskResult {
  success: boolean
  imageUrl?: string
  error?: string
}

export default function GenerateTab() {
  const { config, addImageWithCache, loading, setLoading } = useImageStore()
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState('1024x1024')
  const [error, setError] = useState('')
  const [templateOpen, setTemplateOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [count, setCount] = useState(1)
  const [batchSize, setBatchSize] = useState(1)
  const [concurrency, setConcurrency] = useState(1)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const abortRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const categories = Array.from(new Set(PROMPT_TEMPLATES.map((t) => t.category)))
  const filteredTemplates = selectedCategory
    ? PROMPT_TEMPLATES.filter((t) => t.category === selectedCategory)
    : PROMPT_TEMPLATES

  const handleTemplateSelect = (templatePrompt: string) => {
    setPrompt(templatePrompt)
    setTemplateOpen(false)
  }

  const runTask = useCallback(async (
    currentPrompt: string,
    currentSize: string,
    n: number,
    signal?: AbortSignal
  ): Promise<TaskResult[]> => {
    try {
      const result = await generateImage(config, currentPrompt, currentSize, n, signal)
      const taskResults: TaskResult[] = []
      for (const item of result.data) {
        const imageUrl = getImageSrc(item)
        if (imageUrl) {
          addImageWithCache({
            id: crypto.randomUUID(),
            type: 'generation',
            prompt: currentPrompt,
            imageUrl,
            createdAt: Date.now(),
            size: currentSize,
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
        error: err instanceof Error ? err.message : '生成失败',
      }]
    }
  }, [config, addImageWithCache])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    if (!config.apiKey) {
      setError('请先在配置中填写 API Key')
      return
    }
    if (count < 1) {
      setError('生成数量至少为 1')
      return
    }
    if (count < batchSize) {
      setError('生成数量不能小于单次生成数量')
      return
    }
    if (batchSize < 1 || batchSize > 10) {
      setError('单次生成数量需在 1-10 之间')
      return
    }
    if (concurrency < 1 || concurrency > 10) {
      setError('并发数量需在 1-10 之间')
      return
    }
    if (count > 9999) {
      setError('生成数量不能超过 9999')
      return
    }

    setError('')
    setLoading(true)
    abortRef.current = false
    abortControllerRef.current = new AbortController()
    setProgress({ current: 0, total: count })

    const currentPrompt = prompt.trim()
    const currentSize = size
    let completedTasks = 0
    const results: TaskResult[] = []

    const taskQueue: number[] = []
    let remaining = count
    while (remaining > 0) {
      const n = Math.min(remaining, batchSize)
      taskQueue.push(n)
      remaining -= n
    }

    try {
      const runningTasks = new Set<Promise<void>>()

      const processTask = async (n: number): Promise<void> => {
        if (abortRef.current) return
        const taskResults = await runTask(currentPrompt, currentSize, n, abortControllerRef.current?.signal)
        if (abortRef.current) return
        results.push(...taskResults)
        const delta = taskResults.filter((r) => r.success).length
        completedTasks += delta
        setProgress({ current: Math.min(completedTasks, count), total: count })
        if (delta > 0 && delta < n && !abortRef.current) {
          taskQueue.push(n - delta)
        }
      }

      while (taskQueue.length > 0 || runningTasks.size > 0) {
        while (runningTasks.size < concurrency && taskQueue.length > 0) {
          const n = taskQueue.shift()!
          const taskPromise = processTask(n).finally(() => {
            runningTasks.delete(taskPromise)
          })
          runningTasks.add(taskPromise)
        }

        if (runningTasks.size > 0) {
          await Promise.race(runningTasks)
        }

        if (abortRef.current) break
      }

      const failedCount = results.filter((r) => !r.success).length
      if (failedCount > 0 && failedCount === results.length) {
        const firstError = results.find((r) => r.error)?.error
        setError(firstError || '全部生成失败')
      } else if (failedCount > 0) {
        setError(`${failedCount} 张图片生成失败`)
      }

      if (results.some((r) => r.success)) {
        setPrompt('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败')
    } finally {
      setLoading(false)
      setProgress({ current: 0, total: 0 })
      abortRef.current = false
      abortControllerRef.current = null
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-surface-200">
            <Sparkles className="w-4 h-4 text-brand-400" />
            提示词
          </label>
          <button
            onClick={() => setTemplateOpen(!templateOpen)}
            className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            提示词模板
            {templateOpen ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {templateOpen && (
          <div className="glass-card p-4 space-y-3 animate-slide-up">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${
                  selectedCategory === null
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'bg-surface-900/80 text-surface-400 border border-surface-700/30 hover:border-brand-500/20'
                }`}
              >
                全部
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs transition-all ${
                    selectedCategory === cat
                      ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                      : 'bg-surface-900/80 text-surface-400 border border-surface-700/30 hover:border-brand-500/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5">
              {filteredTemplates.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTemplateSelect(template.prompt)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-surface-900/50 hover:bg-brand-500/5 border border-transparent hover:border-brand-500/10 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-surface-300 group-hover:text-brand-400 transition-colors">
                      {template.label}
                    </span>
                    <span className="text-[10px] text-surface-600">{template.category}</span>
                  </div>
                  <p className="text-[11px] text-surface-500 mt-0.5 line-clamp-1">
                    {template.prompt.slice(0, 80)}...
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述你想要生成的图片...&#10;提示：点击右上角「提示词模板」快速选择"
          rows={4}
          className="input-field resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleGenerate()
            }
          }}
        />
        <p className="text-xs text-surface-500">按 Ctrl+Enter 快速生成 · 模板中 {`{变量}`} 替换为你的内容</p>
      </div>

      <SizeSelector value={size} onChange={setSize} />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-surface-200">生成数量</label>
        </div>
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

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-surface-200">单次生成数量</label>
          <span className="text-[10px] text-surface-500">需api站点支持</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={10}
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            className="flex-1 accent-brand-500"
          />
          <input
            type="number"
            min={1}
            max={10}
            value={batchSize}
            onChange={(e) => setBatchSize(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
            className="input-field w-20 text-center font-mono text-xs"
          />
        </div>
        {count > batchSize && (
          <p className="text-[10px] text-surface-500">
            将发送 <span className="text-brand-400 font-mono">{Math.ceil(count / batchSize)}</span> 次请求，每次请求 <span className="text-brand-400 font-mono">{batchSize}</span> 张
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-surface-200">并发数量</label>
          <span className="text-[10px] text-surface-500">不要超过 API 站点限制</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={10}
            value={concurrency}
            onChange={(e) => setConcurrency(Number(e.target.value))}
            className="flex-1 accent-brand-500"
          />
          <input
            type="number"
            min={1}
            max={10}
            value={concurrency}
            onChange={(e) => setConcurrency(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
            className="input-field w-20 text-center font-mono text-xs"
          />
        </div>
        {count > batchSize && (
          <p className="text-[10px] text-surface-500">
            最多同时发送 <span className="text-brand-400 font-mono">{concurrency}</span> 个请求
          </p>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-up">
          {error}
        </div>
      )}

      {loading && progress.total > 0 && (
        <div className="px-4 py-3 rounded-xl bg-brand-500/5 border border-brand-500/10 space-y-2 animate-slide-up">
          <div className="flex items-center justify-between text-xs">
            <span className="text-surface-400">生成进度</span>
            <span className="text-brand-400 font-mono">{progress.current} / {progress.total}</span>
          </div>
          <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-300"
              style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              生成中 {progress.current > 0 ? `(${progress.current}/${progress.total})` : ''}
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4" />
              生成 {count} 张图片
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
