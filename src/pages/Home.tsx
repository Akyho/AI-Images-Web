import { useImageStore } from '@/store/useImageStore'
import ConfigPanel from '@/components/ConfigPanel'
import GenerateTab from '@/components/GenerateTab'
import EditTab from '@/components/EditTab'
import ImageGallery from '@/components/ImageGallery'
import ImagePreview from '@/components/ImagePreview'
import { Sparkles, Pencil } from 'lucide-react'

export default function Home() {
  const { activeTab, setActiveTab } = useImageStore()

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-950">
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-surface-700/30 shrink-0 bg-surface-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <h1 className="font-mono text-base sm:text-lg font-bold text-surface-100 tracking-tight">
              AI Image Studio
            </h1>
            <p className="text-[10px] sm:text-xs text-surface-500">本地运行 · 隐私安全</p>
          </div>
        </div>
        <ConfigPanel />
      </header>

      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-6">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
          <div className="glass-card p-4 sm:p-6">
            <div className="flex gap-1 mb-5 sm:mb-6 border-b border-surface-700/30">
              <button
                onClick={() => setActiveTab('generate')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-300 ${
                  activeTab === 'generate' ? 'tab-active' : 'tab-inactive'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                图片生成
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-300 ${
                  activeTab === 'edit' ? 'tab-active' : 'tab-inactive'
                }`}
              >
                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                图片编辑
              </button>
            </div>

            {activeTab === 'generate' ? <GenerateTab /> : <EditTab />}
          </div>

          <ImageGallery />
        </div>
      </div>

      <ImagePreview />
    </div>
  )
}
