/**
 * Offline Cache Utility
 * Provides client-side local caching for query functions (Server Actions).
 */

export async function withOfflineCache<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  fallbackValue: T
): Promise<T> {
  if (typeof window === 'undefined') {
    // Return early if server-side rendering
    return queryFn();
  }

  // Fast offline check: if the browser reports offline, don't even try to query the network.
  // This avoids slow network timeouts and serves cached data instantly.
  if (!navigator.onLine) {
    console.warn(`[Offline Cache] Device is offline. Directly serving cached data for "${cacheKey}"...`);
    
    // Trigger global event notifying offline status or cached display
    window.dispatchEvent(new CustomEvent('app-offline-active', { detail: { key: cacheKey } }));

    const cached = localStorage.getItem(`offline_cache:${cacheKey}`);
    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch (e) {
        console.error(`[Offline Cache] Failed to parse cached data for key "${cacheKey}"`, e);
      }
    }
    return fallbackValue;
  }

  try {
    const data = await queryFn();
    if (data !== undefined && data !== null && (typeof data !== 'boolean' || data === true)) {
      localStorage.setItem(`offline_cache:${cacheKey}`, JSON.stringify(data));
      localStorage.setItem(`offline_cache_time:${cacheKey}`, new Date().toISOString());
      registerCacheKey(cacheKey);
    }
    return data;
  } catch (error) {
    console.warn(`[Offline Cache] Query failed for "${cacheKey}". Falling back to cached data...`, error);
    
    // Trigger global event notifying offline status or cached display
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-offline-active', { detail: { key: cacheKey } }));
    }

    const cached = localStorage.getItem(`offline_cache:${cacheKey}`);
    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch (e) {
        console.error(`[Offline Cache] Failed to parse cached data for key "${cacheKey}"`, e);
      }
    }
    return fallbackValue;
  }
}

/**
 * Registers a key in the list of known cached keys for scanning later.
 */
function registerCacheKey(key: string) {
  try {
    const keysStr = localStorage.getItem('offline_cache_keys') || '[]';
    const keys = JSON.parse(keysStr) as string[];
    if (!keys.includes(key)) {
      keys.push(key);
      localStorage.setItem('offline_cache_keys', JSON.stringify(keys));
    }
  } catch (e) {
    console.error('[Offline Cache] Failed to register cache key', e);
  }
}

/**
 * Compiles all locally cached items across different warehouses and search runs
 * into a single unified list for offline searching.
 */
export function getCachedAllItems(): any[] {
  if (typeof window === 'undefined') return [];
  const itemsMap = new Map<string, any>();
  
  try {
    const keysStr = localStorage.getItem('offline_cache_keys') || '[]';
    const keys = JSON.parse(keysStr) as string[];
    
    // 1. Process items cached inside individual warehouse storage caches
    for (const key of keys) {
      if (key.startsWith('storage_items:')) {
        const cachedStr = localStorage.getItem(`offline_cache:${key}`);
        if (cachedStr) {
          try {
            const storageItems = JSON.parse(cachedStr) as any[];
            const storageId = key.replace('storage_items:', '');
            const storageInfoStr = localStorage.getItem(`offline_cache:storage_info:${storageId}`);
            const storageName = storageInfoStr ? JSON.parse(storageInfoStr)?.name : 'Warehouse';
            
            for (const item of storageItems) {
              itemsMap.set(item.id, {
                ...item,
                storage_name: storageName || item.storage_name || 'Warehouse'
              });
            }
          } catch (e) {
            console.error(`[Offline Cache] Error parsing items for ${key}`, e);
          }
        }
      }
    }

    // 2. Add items cached in individual item info pages
    for (const key of keys) {
      if (key.startsWith('item_info:')) {
        const cachedStr = localStorage.getItem(`offline_cache:${key}`);
        if (cachedStr) {
          try {
            const item = JSON.parse(cachedStr);
            if (item && item.id && !itemsMap.has(item.id)) {
              itemsMap.set(item.id, item);
            }
          } catch (e) {
            console.error(`[Offline Cache] Error parsing item ${key}`, e);
          }
        }
      }
    }

    // 3. Fallback to searching inside main Search page caches if empty
    for (const key of keys) {
      if (key.startsWith('search_results:')) {
        const cachedStr = localStorage.getItem(`offline_cache:${key}`);
        if (cachedStr) {
          try {
            const searchItems = JSON.parse(cachedStr) as any[];
            for (const item of searchItems) {
              if (item && item.id && !itemsMap.has(item.id)) {
                itemsMap.set(item.id, item);
              }
            }
          } catch (e) {
            console.error(`[Offline Cache] Error parsing search cache ${key}`, e);
          }
        }
      }
    }
  } catch (e) {
    console.error('[Offline Cache] Failed to build client-side item index', e);
  }
  
  return Array.from(itemsMap.values());
}
