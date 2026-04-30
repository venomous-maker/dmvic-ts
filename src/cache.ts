/**
 * Token caching implementations for the DMVIC client.
 *
 * Provides an in-memory {@link TTLCache} and a file-backed {@link FileTTLCache}
 * (used by default) that persists tokens across process restarts.
 *
 * @module cache
 */

import * as fs from 'node:fs';
import * as os from 'os';
import * as path from 'path';

/**
 * Internal cache entry wrapping a value with its expiration timestamp.
 * @internal
 */
interface CacheItem<V> {
  /** The cached value */
  value: V;
  /** Unix-epoch millisecond timestamp when this entry expires */
  expiry: number;
}

/**
 * Contract for any token-storage backend.
 *
 * Both {@link TTLCache} and {@link FileTTLCache} implement this interface,
 * making it easy to swap storage strategies.
 */
export interface TokenStorage {
  /** Store a token with the given TTL (milliseconds). Falls back to implementation default when omitted. */
  set(key: string, value: string, ttl?: number): void;
  /** Retrieve a token, or `null` if missing / expired. */
  get(key: string): string | null;
  /** Return true when the key exists and has not expired. */
  has(key: string): boolean;
  /** Remove a token by key. */
  remove(key: string): void;
  /** Get and remove a token in a single operation. */
  pop(key: string): string | null;
}

/**
 * Generic in-memory cache with per-entry time-to-live (TTL).
 *
 * A background cleanup timer automatically evicts expired entries.
 *
 * @typeParam K - Key type
 * @typeParam V - Value type
 *
 * @example
 * ```typescript
 * const cache = new TTLCache<string, string>(60_000); // 1-minute default TTL
 * cache.set('token', 'abc123');
 * cache.get('token'); // 'abc123'
 * cache.destroy();    // stop the cleanup timer
 * ```
 */
export class TTLCache<K, V> implements TokenStorage {
  private items: Map<K, CacheItem<V>>;
  private cleanupInterval: NodeJS.Timeout;
  private defaultTTL: number;

  constructor(defaultTTL: number) {
    this.items = new Map();
    this.defaultTTL = defaultTTL;

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, Math.max(defaultTTL / 10, 1000));
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
  set(key: string, value: string, ttl?: number): void;
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

  has(key: K): boolean;
  has(key: string): boolean;
  has(key: K | string): boolean {
    const item = this.items.get(key as K);
    if (!item) {
      return false;
    }

    if (this.isExpired(item)) {
      this.items.delete(key as K);
      return false;
    }

    return true;
  }

  remove(key: K): void;
  remove(key: string): void;
  remove(key: K | string): void {
    this.items.delete(key as K);
  }

  pop(key: K): V | null;
  pop(key: string): string | null;
  pop(key: K | string): V | string | null {
    const value = this.get(key as any);
    if (value !== null) {
      this.remove(key as any);
    }
    return value;
  }

  clear(): void {
    this.items.clear();
  }

  size(): number {
    this.cleanup();
    return this.items.size;
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}


/**
 * Configuration for {@link FileTTLCache}.
 *
 * The `username`, `password`, and `clientId` fields are base64url-encoded to
 * derive the cache directory and filename so each credential set gets its own
 * isolated cache file inside the system temp directory.
 */
export interface FileTTLCacheConfig {
  /** DMVIC API username — used to derive the cache subdirectory name. */
  username: string;
  /** DMVIC API password — combined with `clientId` to derive the cache filename. */
  password: string;
  /** DMVIC client identifier — combined with `password` to derive the cache filename. */
  clientId: string;
  /**
   * Default TTL in milliseconds for cache entries.
   * @default 3600000 (1 hour)
   */
  defaultTTL?: number;
}

/**
 * File-backed token cache with per-entry TTL.
 *
 * Tokens are persisted to a JSON file under the system temp directory so they
 * survive process restarts.  The cache directory and filename are derived from
 * the caller's credentials via base64url encoding:
 *
 * ```
 * <os.tmpdir()>/dmvic-cache/<base64url(username)>/<base64url(clientId:password)>.json
 * ```
 *
 * Expired entries are evicted lazily on every `get` / `has` / `pop` call.
 *
 * @example
 * ```typescript
 * const cache = new FileTTLCache({
 *   username: 'alice',
 *   password: 'secret',
 *   clientId: 'client-001',
 *   defaultTTL: 86_400_000, // 24 h
 * });
 * cache.set('token', 'abc123');
 * cache.get('token'); // 'abc123'
 * ```
 */
export class FileTTLCache implements TokenStorage {
  private readonly filePath: string;
  private readonly defaultTTL: number;

  constructor(config: FileTTLCacheConfig) {
    this.defaultTTL = config.defaultTTL ?? 3_600_000;

    const folderName = Buffer.from(config.username).toString('base64url');
    const fileName =
      Buffer.from(`${config.clientId}:${config.password}`).toString('base64url') + '.json';

    const cacheDir = path.join(os.tmpdir(), 'dmvic-cache', folderName);
    fs.mkdirSync(cacheDir, { recursive: true });

    this.filePath = path.join(cacheDir, fileName);

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '{}', 'utf8');
    }
  }

  private readStore(): Record<string, { value: string; expiry: number }> {
    try {
      return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
    } catch {
      return {};
    }
  }

  private writeStore(store: Record<string, { value: string; expiry: number }>): void {
    fs.writeFileSync(this.filePath, JSON.stringify(store, null, 2), 'utf8');
  }

  set(key: string, value: string, ttl?: number): void {
    const store = this.readStore();
    store[key] = { value, expiry: Date.now() + (ttl ?? this.defaultTTL) };
    this.writeStore(store);
  }

  get(key: string): string | null {
    const store = this.readStore();
    const item = store[key];
    if (!item) return null;
    if (Date.now() > item.expiry) {
      delete store[key];
      this.writeStore(store);
      return null;
    }
    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  remove(key: string): void {
    const store = this.readStore();
    if (key in store) {
      delete store[key];
      this.writeStore(store);
    }
  }

  pop(key: string): string | null {
    const value = this.get(key);
    if (value !== null) this.remove(key);
    return value;
  }
}