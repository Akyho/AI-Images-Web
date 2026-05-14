import { create } from 'zustand'
import { urlToBase64 } from '@/utils/imageCache'
import { getAllImages, addImageToDB, removeImageFromDB, clearImagesFromDB } from '@/utils/db'

export interface ImageRecord {
  id: string
  type: 'generation' | 'edit'
  prompt: string
  imageUrl: string
  createdAt: number
  size?: string
  modelId: string
}

export interface AppConfig {
  baseUrl: string
  modelId: string
  apiKey: string
  genEndpoint: string
  editEndpoint: string
  maxSavedImages: number
  customSizePresets: string[]
  galleryColumns: number
}

interface ImageStore {
  config: AppConfig
  images: ImageRecord[]
  loading: boolean
  activeTab: 'generate' | 'edit'
  previewImage: ImageRecord | null
  configPanelOpen: boolean

  setConfig: (config: Partial<AppConfig>) => void
  addImageWithCache: (image: ImageRecord) => void
  removeImage: (id: string) => void
  clearImages: () => void
  setLoading: (loading: boolean) => void
  setActiveTab: (tab: 'generate' | 'edit') => void
  setPreviewImage: (image: ImageRecord | null) => void
  setConfigPanelOpen: (open: boolean) => void
}

const CONFIG_KEY = 'ai-image-studio-config'

const DEFAULT_CONFIG: AppConfig = {
  baseUrl: '',
  modelId: '',
  apiKey: '',
  genEndpoint: '',
  editEndpoint: '',
  maxSavedImages: 100,
  customSizePresets: [],
  galleryColumns: 3,
}

function loadConfig(): AppConfig {
  try {
    const saved = localStorage.getItem(CONFIG_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...DEFAULT_CONFIG, ...parsed }
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_CONFIG }
}

function saveConfig(config: AppConfig) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  } catch {
    // ignore
  }
}

function trimImages(images: ImageRecord[], max: number): ImageRecord[] {
  if (images.length <= max) return images
  return images.slice(0, max)
}

export const useImageStore = create<ImageStore>((set, get) => ({
  config: loadConfig(),
  images: [],
  loading: false,
  activeTab: 'generate',
  previewImage: null,
  configPanelOpen: false,

  setConfig: (partial) => {
    const newConfig = { ...get().config, ...partial }
    saveConfig(newConfig)
    set({ config: newConfig })
  },

  addImageWithCache: (image) => {
    set((state) => {
      const newImages = trimImages([image, ...state.images], state.config.maxSavedImages)
      return { images: newImages }
    })

    const cacheInBackground = async () => {
      let cachedUrl = image.imageUrl
      if (!cachedUrl.startsWith('data:')) {
        try {
          cachedUrl = await urlToBase64(image.imageUrl)
        } catch {
          return
        }
      }
      if (cachedUrl !== image.imageUrl) {
        set((state) => ({
          images: state.images.map((img) =>
            img.id === image.id ? { ...img, imageUrl: cachedUrl } : img
          ),
        }))
      }
      await addImageToDB({ ...image, imageUrl: cachedUrl })
    }
    cacheInBackground()
  },

  removeImage: (id) => {
    set((state) => ({ images: state.images.filter((img) => img.id !== id) }))
    removeImageFromDB(id).catch(() => {})
  },

  clearImages: () => {
    set({ images: [] })
    clearImagesFromDB().catch(() => {})
  },

  setLoading: (loading) => {
    set({ loading })
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab })
  },

  setPreviewImage: (image) => {
    set({ previewImage: image })
  },

  setConfigPanelOpen: (open) => {
    set({ configPanelOpen: open })
  },
}))

getAllImages().then((images) => {
  const max = useImageStore.getState().config.maxSavedImages
  if (images.length > max) {
    images = images.slice(0, max)
  }
  useImageStore.setState({ images })
}).catch(() => {})
