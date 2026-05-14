import { useState, useEffect } from 'react'
import { useImageStore } from '@/store/useImageStore'
import { Settings, X, Key, Globe, Cpu, Eye, EyeOff, Link, ToggleLeft, ToggleRight, Trash2, Database, Eraser } from 'lucide-react'

export default function ConfigPanel() {
  const { config, setConfig, configPanelOpen, setConfigPanelOpen, images, clearImages } = useImageStore()
  const [showApiKey, setShowApiKey] = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)
  const [cacheClearConfirm, setCacheClearConfirm] = useState(false)
  const [customGenOpen, setCustomGenOpen] = useState(!!config.genEndpoint.trim())
  const [customEditOpen, setCustomEditOpen] = useState(!!config.editEndpoint.trim())

  useEffect(() => {
    setCustomGenOpen(!!config.genEndpoint.trim())
  }, [config.genEndpoint])

  useEffect(() => {
    setCustomEditOpen(!!config.editEndpoint.trim())
  }, [config.editEndpoint])

  const genUrlPreview = config.genEndpoint.trim() || `${config.baseUrl.replace(/\/+$/, '')}/v1/images/generations`
  const editUrlPreview = config.editEndpoint.trim() || `${config.baseUrl.replace(/\/+$/, '')}/v1/images/edits`

  const toggleCustomGen = () => {
    if (customGenOpen) {
      setConfig({ genEndpoint: '' })
      setCustomGenOpen(false)
    } else {
      setCustomGenOpen(true)
    }
  }

  const toggleCustomEdit = () => {
    if (customEditOpen) {
      setConfig({ editEndpoint: '' })
      setCustomEditOpen(false)
    } else {
      setCustomEditOpen(true)
    }
  }

  return (
    <>
      <button
        onClick={() => setConfigPanelOpen(true)}
        className="p-2 rounded-xl hover:bg-surface-800/80 text-surface-400 hover:text-brand-400 transition-colors"
        title="打开配置"
      >
        <Settings className="w-5 h-5" />
      </button>

      {configPanelOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 pb-8 animate-fade-in"
          onClick={() => setConfigPanelOpen(false)}
        >
          <div className="absolute inset-0 bg-surface-950/70 backdrop-blur-sm" />

          <div
            className="relative w-full max-w-md lg:max-w-lg glass-card rounded-2xl animate-slide-up max-h-[calc(100vh-6rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-surface-700/50">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-brand-400" />
                <h2 className="font-mono text-sm font-semibold text-brand-400 tracking-wider uppercase">
                  设置
                </h2>
              </div>
              <button
                onClick={() => setConfigPanelOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-surface-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-surface-300">
                  <Globe className="w-3.5 h-3.5 text-brand-500" />
                  API 基础地址
                </label>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={(e) => setConfig({ baseUrl: e.target.value })}
                  placeholder="https://api.example.com"
                  className="input-field font-mono text-xs"
                />
                <p className="text-[10px] text-surface-500">用于拼接默认端点</p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-surface-300">
                  <Cpu className="w-3.5 h-3.5 text-brand-500" />
                  模型 ID
                </label>
                <input
                  type="text"
                  value={config.modelId}
                  onChange={(e) => setConfig({ modelId: e.target.value })}
                  placeholder="输入模型 ID，如 gpt-image-2"
                  className="input-field font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-surface-300">
                  <Key className="w-3.5 h-3.5 text-brand-500" />
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={config.apiKey}
                    onChange={(e) => setConfig({ apiKey: e.target.value.replace(/\s/g, '') })}
                    placeholder="sk-..."
                    className="input-field font-mono text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-brand-400 transition-colors"
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-surface-700/30 space-y-4">
                <div className="space-y-2">
                  <button
                    onClick={toggleCustomGen}
                    className="flex items-center gap-2 text-xs font-medium text-surface-300 hover:text-brand-400 transition-colors"
                  >
                    {customGenOpen ? (
                      <ToggleRight className="w-4 h-4 text-brand-400" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-surface-500" />
                    )}
                    <Link className="w-3.5 h-3.5 text-brand-500" />
                    自定义生成端点
                  </button>
                  {customGenOpen && (
                    <div className="animate-slide-up">
                      <input
                        type="text"
                        value={config.genEndpoint}
                        onChange={(e) => setConfig({ genEndpoint: e.target.value })}
                        placeholder="https://api.example.com/v1beta/models/model:generateContent"
                        className="input-field font-mono text-xs"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    onClick={toggleCustomEdit}
                    className="flex items-center gap-2 text-xs font-medium text-surface-300 hover:text-brand-400 transition-colors"
                  >
                    {customEditOpen ? (
                      <ToggleRight className="w-4 h-4 text-brand-400" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-surface-500" />
                    )}
                    <Link className="w-3.5 h-3.5 text-brand-500" />
                    自定义编辑端点
                  </button>
                  {customEditOpen && (
                    <div className="animate-slide-up">
                      <input
                        type="text"
                        value={config.editEndpoint}
                        onChange={(e) => setConfig({ editEndpoint: e.target.value })}
                        placeholder="https://api.example.com/v1/images/edits"
                        className="input-field font-mono text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-surface-700/30 space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-surface-300">
                    <Database className="w-3.5 h-3.5 text-brand-500" />
                    最大保存数量
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={500}
                      step={1}
                      value={Math.min(config.maxSavedImages, 500)}
                      onChange={(e) => setConfig({ maxSavedImages: Number(e.target.value) })}
                      className="flex-1 accent-brand-500"
                    />
                    <input
                      type="number"
                      min={1}
                      max={9999}
                      value={config.maxSavedImages}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        setConfig({ maxSavedImages: v < 1 ? 1 : v > 9999 ? 9999 : Math.round(v) })
                      }}
                      className="input-field w-20 text-center font-mono text-xs"
                    />
                  </div>
                  <p className="text-[10px] text-surface-500">
                    当前已保存 <span className="text-brand-400 font-mono">{images.length}</span> 张，超出上限后自动删除最早的图片
                  </p>
                </div>

                {clearConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-400">确定要清空全部 {images.length} 张图片吗？</span>
                    <button
                      onClick={() => {
                        clearImages()
                        setClearConfirm(false)
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition-colors"
                    >
                      确认清空
                    </button>
                    <button
                      onClick={() => setClearConfirm(false)}
                      className="px-3 py-1.5 rounded-lg bg-surface-700/50 text-surface-400 text-xs hover:bg-surface-600/50 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setClearConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    清空全部图片
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {cacheClearConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-400">确定要清除所有页面缓存吗？页面将重新加载</span>
                    <button
                      onClick={() => {
                        localStorage.clear()
                        clearImages()
                        window.location.reload()
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs hover:bg-amber-500/30 transition-colors"
                    >
                      确认清除
                    </button>
                    <button
                      onClick={() => setCacheClearConfirm(false)}
                      className="px-3 py-1.5 rounded-lg bg-surface-700/50 text-surface-400 text-xs hover:bg-surface-600/50 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setCacheClearConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors text-sm"
                  >
                    <Eraser className="w-4 h-4" />
                    清除页面缓存
                  </button>
                )}
              </div>

              <div className="pt-2 border-t border-surface-700/30">
                <div className="space-y-2">
                  <p className="text-xs text-surface-500">生成端点</p>
                  <code className="block text-xs font-mono text-brand-400/70 bg-surface-900/80 px-3 py-2 rounded-lg break-all">
                    {genUrlPreview}
                  </code>
                </div>
                <div className="space-y-2 mt-3">
                  <p className="text-xs text-surface-500">编辑端点</p>
                  <code className="block text-xs font-mono text-brand-400/70 bg-surface-900/80 px-3 py-2 rounded-lg break-all">
                    {editUrlPreview}
                  </code>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-500/5 border border-brand-500/10">
                  <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-slow" />
                  <p className="text-xs text-surface-400">
                    所有数据仅在浏览器本地处理
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
