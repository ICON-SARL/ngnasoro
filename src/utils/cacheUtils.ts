
// This is a mock implementation of a Redis-like caching system
// In a real application, this would interface with an actual Redis instance

interface CacheEntry {
  value: any;
  expiresAt: number;
}

class SfdCache {
  private cache: { [sfdId: string]: { [key: string]: CacheEntry } } = {};
  private DEFAULT_TTL = 15 * 60 * 1000; // 15 minutes in milliseconds

  /**
   * Set a value in the cache
   * @param sfdId The SFD namespace
   * @param key The cache key
   * @param value The value to cache
   * @param ttl Time to live in milliseconds (default: 15min)
   */
  set(sfdId: string, key: string, value: any, ttl: number = this.DEFAULT_TTL): void {
    if (!this.cache[sfdId]) {
      this.cache[sfdId] = {};
    }

    this.cache[sfdId][key] = {
      value,
      expiresAt: Date.now() + ttl
    };
  }

  /**
   * Get a value from the cache
   * @param sfdId The SFD namespace
   * @param key The cache key
   * @returns The cached value or null if not found or expired
   */
  get(sfdId: string, key: string): any | null {
    if (!this.cache[sfdId] || !this.cache[sfdId][key]) {
      return null;
    }

    const entry = this.cache[sfdId][key];
    
    // Check if the entry has expired
    if (Date.now() > entry.expiresAt) {
      this.delete(sfdId, key);
      return null;
    }

    return entry.value;
  }

  /**
   * Delete a value from the cache
   * @param sfdId The SFD namespace
   * @param key The cache key
   */
  delete(sfdId: string, key: string): void {
    if (this.cache[sfdId] && this.cache[sfdId][key]) {
      delete this.cache[sfdId][key];
    }
  }

  /**
   * Clear all cache entries for a specific SFD
   * @param sfdId The SFD namespace
   */
  clearSfd(sfdId: string): void {
    if (this.cache[sfdId]) {
      delete this.cache[sfdId];
    }
  }

  /**
   * Clear the entire cache
   */
  clearAll(): void {
    this.cache = {};
  }
}

// Create and export a singleton instance
export const sfdCache = new SfdCache();
