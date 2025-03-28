
import { sfdCache } from './cacheUtils';

export interface CacheOptions {
  ttl?: number;  // Time to live in milliseconds
  namespace?: string;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes by default
const DEFAULT_NAMESPACE = 'default';

export class CacheService {
  /**
   * Récupère une valeur du cache
   */
  static async get<T>(key: string, sfdId?: string): Promise<T | null> {
    const cacheKey = this.formatKey(key);
    return sfdCache.get(sfdId || DEFAULT_NAMESPACE, cacheKey);
  }

  /**
   * Stocke une valeur dans le cache
   */
  static async set<T>(
    key: string, 
    value: T, 
    options: CacheOptions = {}
  ): Promise<void> {
    const { ttl = DEFAULT_TTL, namespace = DEFAULT_NAMESPACE } = options;
    const cacheKey = this.formatKey(key);
    sfdCache.set(namespace, cacheKey, value, ttl);
  }

  /**
   * Récupère une valeur du cache, ou l'ajoute si elle n'existe pas
   */
  static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { namespace = DEFAULT_NAMESPACE } = options;
    const cacheKey = this.formatKey(key);
    
    // Essayer de récupérer du cache
    const cachedValue = sfdCache.get(namespace, cacheKey);
    if (cachedValue !== null) {
      return cachedValue as T;
    }
    
    // Si non présent, appeler le fetcher
    const value = await fetcher();
    
    // Mettre en cache
    this.set(key, value, options);
    
    return value;
  }

  /**
   * Supprime une valeur du cache
   */
  static async delete(key: string, namespace: string = DEFAULT_NAMESPACE): Promise<void> {
    const cacheKey = this.formatKey(key);
    sfdCache.delete(namespace, cacheKey);
  }

  /**
   * Efface tout le cache pour un SFD spécifique
   */
  static async clearNamespace(namespace: string = DEFAULT_NAMESPACE): Promise<void> {
    sfdCache.clearSfd(namespace);
  }

  /**
   * Efface tout le cache
   */
  static async clearAll(): Promise<void> {
    sfdCache.clearAll();
  }

  /**
   * Formatage de clé cohérent
   */
  private static formatKey(key: string): string {
    return key.replace(/\s+/g, '_').toLowerCase();
  }
}
