/**
 * The only door to persistent data. v1 uses localStorage; a backend can be added
 * later by providing another StorageAdapter (or swapping persistence.ts for an
 * async repository) without touching any component.
 */
export interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/** Falls back to memory when localStorage is blocked (private mode, quota, etc.). */
export class LocalStorageAdapter implements StorageAdapter {
  private memory = new Map<string, string>()

  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return this.memory.get(key) ?? null
    }
  }
  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      this.memory.set(key, value)
    }
  }
  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key)
    } catch {
      this.memory.delete(key)
    }
  }
}

export class MemoryStorageAdapter implements StorageAdapter {
  private memory = new Map<string, string>()
  getItem = (key: string) => this.memory.get(key) ?? null
  setItem = (key: string, value: string) => void this.memory.set(key, value)
  removeItem = (key: string) => void this.memory.delete(key)
}

export function readJson<T>(adapter: StorageAdapter, key: string): T | null {
  try {
    const raw = adapter.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeJson(adapter: StorageAdapter, key: string, value: unknown): void {
  adapter.setItem(key, JSON.stringify(value))
}

export const defaultStorage: StorageAdapter = new LocalStorageAdapter()
