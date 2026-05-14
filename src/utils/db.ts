import type { ImageRecord } from '@/store/useImageStore'

const DB_NAME = 'ai-image-studio'
const DB_VERSION = 1
const STORE_NAME = 'images'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

function closeDb(tx: IDBTransaction, db: IDBDatabase) {
  tx.oncomplete = () => db.close()
  tx.onabort = () => db.close()
  tx.onerror = () => db.close()
}

export async function getAllImages(): Promise<ImageRecord[]> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.getAll()
      request.onsuccess = () => {
        const results = request.result as ImageRecord[]
        resolve(results.sort((a, b) => b.createdAt - a.createdAt))
      }
      request.onerror = () => reject(request.error)
      closeDb(tx, db)
    })
  } catch {
    return []
  }
}

export async function addImageToDB(image: ImageRecord): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.put(image)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    closeDb(tx, db)
  })
}

export async function removeImageFromDB(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    closeDb(tx, db)
  })
}

export async function clearImagesFromDB(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    closeDb(tx, db)
  })
}

