
// This is a mock implementation of a Redis-like caching system
// In a real application, this would interface with an actual Redis instance

interface CacheEntry {
  value: any;
  expiresAt: number;
  createdAt: number;
}

class SfdCache {
  private cache: { [sfdId: string]: { [key: string]: CacheEntry } } = {};
  private DEFAULT_TTL = 5 * 60 * 1000; // Reduced from 15 to 5 minutes

  /**
   * Set a value in the cache with enhanced logging
   */
  set(sfdId: string, key: string, value: any, ttl: number = this.DEFAULT_TTL): void {
    console.log(`[SfdCache] Setting cache for SFD ${sfdId}, key: ${key}`, { value, ttl });

    if (!this.cache[sfdId]) {
      this.cache[sfdId] = {};
    }

    this.cache[sfdId][key] = {
      value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now()
    };
  }

  /**
   * Get a value from the cache with detailed logging
   */
  get(sfdId: string, key: string): any | null {
    if (!this.cache[sfdId] || !this.cache[sfdId][key]) {
      console.log(`[SfdCache] No cache found for SFD ${sfdId}, key: ${key}`);
      return null;
    }

    const entry = this.cache[sfdId][key];
    
    // Check if the entry has expired
    if (Date.now() > entry.expiresAt) {
      console.log(`[SfdCache] Cache expired for SFD ${sfdId}, key: ${key}`);
      this.delete(sfdId, key);
      return null;
    }

    console.log(`[SfdCache] Cache hit for SFD ${sfdId}, key: ${key}`, {
      age: Date.now() - entry.createdAt,
      remainingTTL: entry.expiresAt - Date.now()
    });

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
