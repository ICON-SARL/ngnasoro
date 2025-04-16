
// This is a mock implementation of a Redis-like caching system
// In a real application, this would interface with an actual Redis instance

interface CacheEntry {
  value: any;
  expiresAt: number;
  createdAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
}

class SfdCache {
  private cache: { [sfdId: string]: { [key: string]: CacheEntry } } = {};
  private DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0
  };

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
    
    this.stats.sets++;
    this.updateSize();
  }

  /**
   * Get a value from the cache with detailed logging
   */
  get(sfdId: string, key: string): any | null {
    if (!this.cache[sfdId] || !this.cache[sfdId][key]) {
      console.log(`[SfdCache] No cache found for SFD ${sfdId}, key: ${key}`);
      this.stats.misses++;
      return null;
    }

    const entry = this.cache[sfdId][key];
    
    // Check if the entry has expired
    if (Date.now() > entry.expiresAt) {
      console.log(`[SfdCache] Cache expired for SFD ${sfdId}, key: ${key}`);
      this.delete(sfdId, key);
      this.stats.misses++;
      return null;
    }

    console.log(`[SfdCache] Cache hit for SFD ${sfdId}, key: ${key}`, {
      age: Date.now() - entry.createdAt,
      remainingTTL: entry.expiresAt - Date.now()
    });
    
    this.stats.hits++;
    return entry.value;
  }

  /**
   * Force refresh a cached value by deleting it
   * @param sfdId The SFD namespace
   * @param key The cache key
   */
  refresh(sfdId: string, key: string): void {
    console.log(`[SfdCache] Forcing refresh for SFD ${sfdId}, key: ${key}`);
    this.delete(sfdId, key);
  }

  /**
   * Check if a key exists in the cache and is not expired
   */
  has(sfdId: string, key: string): boolean {
    if (!this.cache[sfdId] || !this.cache[sfdId][key]) {
      return false;
    }
    
    const entry = this.cache[sfdId][key];
    return Date.now() <= entry.expiresAt;
  }

  /**
   * Get the time to live for a cached item
   * @returns Time to live in milliseconds, or -1 if expired/not found
   */
  ttl(sfdId: string, key: string): number {
    if (!this.has(sfdId, key)) {
      return -1;
    }
    
    const entry = this.cache[sfdId][key];
    return Math.max(0, entry.expiresAt - Date.now());
  }

  /**
   * Delete a value from the cache
   * @param sfdId The SFD namespace
   * @param key The cache key
   */
  delete(sfdId: string, key: string): void {
    if (this.cache[sfdId] && this.cache[sfdId][key]) {
      console.log(`[SfdCache] Deleting cache for SFD ${sfdId}, key: ${key}`);
      delete this.cache[sfdId][key];
      this.stats.deletes++;
      this.updateSize();
    }
  }

  /**
   * Clear all cache entries for a specific SFD
   * @param sfdId The SFD namespace
   */
  clearSfd(sfdId: string): void {
    if (this.cache[sfdId]) {
      console.log(`[SfdCache] Clearing all cache for SFD ${sfdId}`);
      delete this.cache[sfdId];
      this.updateSize();
    }
  }

  /**
   * Clear the entire cache
   */
  clearAll(): void {
    console.log(`[SfdCache] Clearing all cache data`);
    this.cache = {};
    this.updateSize();
  }
  
  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }
  
  /**
   * Update the size statistic
   */
  private updateSize(): void {
    let size = 0;
    for (const sfdId in this.cache) {
      size += Object.keys(this.cache[sfdId]).length;
    }
    this.stats.size = size;
  }
  
  /**
   * Debug the cache state
   */
  debug(): void {
    console.log('==== SFD CACHE DEBUG ====');
    console.log('Cache statistics:', this.stats);
    console.log('Cache entries by SFD:');
    
    for (const sfdId in this.cache) {
      const keys = Object.keys(this.cache[sfdId]);
      console.log(`- SFD ${sfdId}: ${keys.length} entries`);
      keys.forEach(key => {
        const entry = this.cache[sfdId][key];
        const expired = Date.now() > entry.expiresAt;
        console.log(`  - ${key}: ${expired ? 'EXPIRED' : 'valid'}, TTL: ${this.ttl(sfdId, key)}ms`);
      });
    }
    console.log('========================');
  }
}

// Create and export a singleton instance
export const sfdCache = new SfdCache();
