import mcache from 'memory-cache';
import createCacheHash from '../../utils/createCacheHash.js';

export default function revalidateCacheMiddleware() {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      const baseUrl = req.baseUrl;
      const fullPath = req.baseUrl + req.path;

      // Function to invalidate cache
      const invalidateCache = (cacheKey) => {
        if (mcache.get(cacheKey)) {
          mcache.del(cacheKey);
        }
      };

      // Invalidate the specific endpoint
      invalidateCache(`__express__${createCacheHash(req)}`);

      // Invalidate all related list endpoints under the same base URL
      const keys = mcache.keys();
      keys.forEach((key) => {
        if (
          key.includes(baseUrl) ||
          (req.params.id && key.includes(fullPath))
        ) {
          invalidateCache(key);
        }
      });
    }

    next();
  };
}
