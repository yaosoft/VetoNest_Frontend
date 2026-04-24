// Create a new file: src/hooks/useCachedData.js
import { useRef, useCallback } from 'react';

// Global cache for API responses across components
const globalCache = new Map();
const pendingRequests = new Map();

export const useCachedData = () => {
  const cache = useRef(globalCache);
  const pending = useRef(pendingRequests);

  const fetchWithCache = useCallback(async (key, fetchFn, ttl = 60000) => {
    // Check cache first
    const cached = cache.current.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    // Check if there's already a pending request for this key
    if (pending.current.has(key)) {
      return pending.current.get(key);
    }

    // Make the request
    const promise = fetchFn().then(data => {
      cache.current.set(key, {
        data,
        timestamp: Date.now()
      });
      pending.current.delete(key);
      return data;
    }).catch(error => {
      pending.current.delete(key);
      throw error;
    });

    pending.current.set(key, promise);
    return promise;
  }, []);

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  return { fetchWithCache, clearCache };
};