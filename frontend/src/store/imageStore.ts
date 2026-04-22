import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ImageStore {
  images: Record<string, string>
  setImage: (id: string, dataUrl: string) => void
  removeImage: (id: string) => void
}

export const useImageStore = create<ImageStore>()(
  persist(
    (set) => ({
      images: {},
      setImage: (id, dataUrl) =>
        set(state => ({ images: { ...state.images, [id]: dataUrl } })),
      removeImage: (id) =>
        set(state => {
          const images = { ...state.images }
          delete images[id]
          return { images }
        }),
    }),
    { name: 'pouplay-images' }
  )
)
