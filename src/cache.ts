/**
 * TTL Cache Implementation
 */

interface CacheItem<V> {
  value: V;
  expiry: number;
}

export interface TokenStorage {
  set(key: string, value: string, ttl: number): void;
  get(key: string): string | null;
  remove(key: string): void;
  pop(key: string): string | null;
}

export class TTLCache<K, V> implements TokenStorage {
  private items: Map<K, CacheItem<V>>;
  private cleanupInterval: ReturnType<typeof setInterval>;
  private defaultTTL: number;

  constructor(defaultTTL: number) {
    this.items = new Map();
    this.defaultTTL = defaultTTL;

    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, Math.max(defaultTTL / 10, 1000));

    // Allow the process to exit even if the interval is active
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.items.entries()) {
      if (item.expiry < now) {
        this.items.delete(key);
      }
    }
  }

  private isExpired(item: CacheItem<V>): boolean {
    return Date.now() > item.expiry;
  }

  // Generic set method
  set(key: K, value: V): void;
  set(key: K, value: V, ttl: number): void;
  // TokenStorage interface method
  set(key: string, value: string, ttl: number): void;
  set(key: K | string, value: V | string, ttlOrUndefined?: number): void {
    const ttl = ttlOrUndefined ?? this.defaultTTL;
    const cacheItem: CacheItem<V | string> = {
      value,
      expiry: Date.now() + ttl,
    };
    this.items.set(key as K, cacheItem as CacheItem<V>);
  }

  get(key: K): V | null;
  get(key: string): string | null;
  get(key: K | string): V | string | null {
    const item = this.items.get(key as K);

    if (!item) {
      return null;
    }

    if (this.isExpired(item)) {
      this.items.delete(key as K);
      return null;
    }

    return item.value;
  }

  remove(key: K): void;
  remove(key: string): void;
  remove(key: K | string): void {
    this.items.delete(key as K);
  }

  pop(key: K): V | null;
  pop(key: string): string | null;
  pop(key: K | string): V | string | null {
    const value = this.get(key as K);
    if (value !== null) {
      this.remove(key as K);
    }
    return value;
  }

  has(key: K): boolean {
    const item = this.items.get(key);
    if (!item) {
      return false;
    }

    if (this.isExpired(item)) {
      this.items.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.items.clear();
  }

  size(): number {
    // Clean up expired items first
    this.cleanup();
    return this.items.size;
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}
