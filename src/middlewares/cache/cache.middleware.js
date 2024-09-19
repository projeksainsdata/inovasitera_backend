import mcache from 'memory-cache';
import createCacheHash from '../../utils/createCacheHash.js';

export default function CacheApiMiddleware(duration) {
  return async (req, res, next) => {
    const key = `__express__${createCacheHash(req)}`;
    const cachedData = mcache.get(key);

    if (cachedData) {
      const {body, timestamp} = cachedData;
      const age = (Date.now() - timestamp) / 1000; // age in seconds

      if (age < duration) {
        res.send(body);
        return;
      }
    }

    res.sendResponse = res.send;
    res.send = (body) => {
      mcache.put(key, {body, timestamp: Date.now()}, duration * 1000);
      res.sendResponse(body);
    };

    next();
  };
}
