import { TTLCache } from "../src/cache";

describe("TTLCache", () => {
  let cache: TTLCache<string, string>;

  beforeEach(() => {
    cache = new TTLCache<string, string>(5000);
  });

  afterEach(() => {
    cache.destroy();
  });

  it("should store and retrieve a value", () => {
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
  });

  it("should return null for a missing key", () => {
    expect(cache.get("nonexistent")).toBeNull();
  });

  it("should remove a value", () => {
    cache.set("key1", "value1");
    cache.remove("key1");
    expect(cache.get("key1")).toBeNull();
  });

  it("should pop a value (get + remove)", () => {
    cache.set("key1", "value1");
    const value = cache.pop("key1");
    expect(value).toBe("value1");
    expect(cache.get("key1")).toBeNull();
  });

  it("should return null when popping a nonexistent key", () => {
    expect(cache.pop("nonexistent")).toBeNull();
  });

  it("should report has correctly", () => {
    cache.set("key1", "value1");
    expect(cache.has("key1")).toBe(true);
    expect(cache.has("nonexistent")).toBe(false);
  });

  it("should clear all items", () => {
    cache.set("key1", "value1");
    cache.set("key2", "value2");
    cache.clear();
    expect(cache.get("key1")).toBeNull();
    expect(cache.get("key2")).toBeNull();
    expect(cache.size()).toBe(0);
  });

  it("should report size correctly", () => {
    expect(cache.size()).toBe(0);
    cache.set("key1", "value1");
    expect(cache.size()).toBe(1);
    cache.set("key2", "value2");
    expect(cache.size()).toBe(2);
  });

  it("should expire items after TTL", async () => {
    const shortCache = new TTLCache<string, string>(50); // 50ms TTL
    shortCache.set("key1", "value1");
    expect(shortCache.get("key1")).toBe("value1");

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(shortCache.get("key1")).toBeNull();
    expect(shortCache.has("key1")).toBe(false);
    shortCache.destroy();
  });

  it("should support custom TTL per entry", async () => {
    cache.set("short", "shortval", 50);
    cache.set("long", "longval", 5000);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(cache.get("short")).toBeNull();
    expect(cache.get("long")).toBe("longval");
  });

  it("should overwrite existing keys", () => {
    cache.set("key1", "first");
    cache.set("key1", "second");
    expect(cache.get("key1")).toBe("second");
  });

  it("should work as TokenStorage interface", () => {
    // TokenStorage methods use string keys and values
    cache.set("token", "abc123", 5000);
    expect(cache.get("token")).toBe("abc123");
    cache.remove("token");
    expect(cache.get("token")).toBeNull();
  });

  it("should clean up on destroy", () => {
    cache.set("key1", "value1");
    cache.destroy();
    expect(cache.size()).toBe(0);
  });
});

