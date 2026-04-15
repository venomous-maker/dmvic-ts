

import * as fs from 'node:fs';
import * as path from 'path';
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
  private cleanupInterval: NodeJS.Timeout;
  private defaultTTL: number;

  constructor(defaultTTL: number) {
    this.items = new Map();
    this.defaultTTL = defaultTTL;

    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, Math.max(defaultTTL / 10, 1000)); // Cleanup every 10% of TTL or 1 second minimum
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
    const value = this.get(key as any);
    if (value !== null) {
      this.remove(key as any);
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


/// implimentation using filesystem
export class FileSystemCache implements TokenStorage {
  
   private fileHandle:number | null = null;
  constructor(private defaultTTL: number = 3600, private filePath: string = "./cache.json") {
    // Implement filesystem-based cache initialization here
      this.init();
  }

  private async init() {
   try {
    const exists =await this.fileExists(this.filePath);
    if(!exists){
        fs.writeFileSync(this.filePath, JSON.stringify({}));
    }
    this.fileHandle = fs.openSync(path.resolve(this.filePath), 'a+');    
    
   } catch (error) {
      console.error('Error initializing cache:', error);
   }
  }

  private  fileExists(_filePath: string): boolean {
    try {
       //  fs.access(filePath,);
      return true; // File exists
    } catch {
      return false; // File does not exist or is inaccessible
    }
  }

  private  readFile<T>():T {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Error reading cache file:', error);
      return {} as T;
    }
  }
  set(key: string, value: string, ttl?: number): void {
    if(this.fileHandle){
        


      ttl = ttl ?? this.defaultTTL;
      const item = { [key]: { value, expiry: Date.now() + ttl } };
     // this.fileHandle.write(JSON.stringify(item));
    }
  }

  get(key: string): string | null {
    throw new Error("Method not implemented.");
  }
  remove(key: string): void {
    throw new Error("Method not implemented.");
  }
  pop(key: string): string | null {
    throw new Error("Method not implemented.");
  }




}
