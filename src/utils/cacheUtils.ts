
// This is a mock implementation of a Redis-like caching system
// In a real application, this would interface with an actual Redis instance

interface CacheEntry {
  value: any;
  expiresAt: number;
}

class SfdCache {
  private cache: { [sfdId: string]: { [key: string]: CacheEntry } } = {};
  private DEFAULT_TTL = 3 * 60 * 1000; // 3 minutes in milliseconds (reduced from 5 minutes)
  private DEBUG = true; // Enable debug logging

  /**
   * Set a value in the cache
   * @param sfdId The SFD namespace
   * @param key The cache key
   * @param value The value to cache
   * @param ttl Time to live in milliseconds (default: 3min)
   */
  set(sfdId: string, key: string, value: any, ttl: number = this.DEFAULT_TTL): void {
    if (!this.cache[sfdId]) {
      this.cache[sfdId] = {};
    }

    const expiresAt = Date.now() + ttl;
    
    this.cache[sfdId][key] = {
      value,
      expiresAt
    };
    
    if (this.DEBUG) {
      console.log(`Cache SET: SFD [${sfdId}] Key [${key}] - Expires in ${ttl/1000}s at ${new Date(expiresAt).toISOString()}`);
    }
  }

  /**
   * Get a value from the cache
   * @param sfdId The SFD namespace
   * @param key The cache key
   * @returns The cached value or null if not found or expired
   */
  get(sfdId: string, key: string): any | null {
    if (!this.cache[sfdId] || !this.cache[sfdId][key]) {
      if (this.DEBUG) {
        console.log(`Cache MISS: SFD [${sfdId}] Key [${key}] - Not in cache`);
      }
      return null;
    }

    const entry = this.cache[sfdId][key];
    const now = Date.now();
    const remainingTime = entry.expiresAt - now;
    
    // Check if the entry has expired
    if (now > entry.expiresAt) {
      if (this.DEBUG) {
        console.log(`Cache EXPIRED: SFD [${sfdId}] Key [${key}] - Expired ${(now - entry.expiresAt)/1000}s ago`);
      }
      this.delete(sfdId, key);
      return null;
    }

    if (this.DEBUG) {
      console.log(`Cache HIT: SFD [${sfdId}] Key [${key}] - Expires in ${remainingTime/1000}s`);
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
      if (this.DEBUG) {
        console.log(`Cache DELETE: SFD [${sfdId}] Key [${key}]`);
      }
      delete this.cache[sfdId][key];
    }
  }

  /**
   * Clear all cache entries for a specific SFD
   * @param sfdId The SFD namespace
   */
  clearSfd(sfdId: string): void {
    if (this.cache[sfdId]) {
      if (this.DEBUG) {
        console.log(`Cache CLEAR SFD: [${sfdId}] - All keys removed`);
      }
      delete this.cache[sfdId];
    }
  }

  /**
   * Clear the entire cache
   */
  clearAll(): void {
    if (this.DEBUG) {
      console.log(`Cache CLEAR ALL: Complete cache reset`);
    }
    this.cache = {};
  }
  
  /**
   * Get cache status information
   * @returns Information about the current cache state
   */
  getStatus(): {totalEntries: number, entriesBySfd: Record<string, number>} {
    const status = {
      totalEntries: 0,
      entriesBySfd: {} as Record<string, number>
    };
    
    Object.keys(this.cache).forEach(sfdId => {
      const keysCount = Object.keys(this.cache[sfdId]).length;
      status.totalEntries += keysCount;
      status.entriesBySfd[sfdId] = keysCount;
    });
    
    return status;
  }
}

// Create and export a singleton instance
export const sfdCache = new SfdCache();
