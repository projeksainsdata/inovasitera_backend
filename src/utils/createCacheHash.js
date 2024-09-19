import crypto from 'crypto';

export default function createCacheHash(req) {
  const components = [
    req.baseUrl + req.path,
    JSON.stringify(sortObject(req.query)),
    JSON.stringify(sortObject(req.params)),
  ];

  // If you have user-specific caching, you might include:
  // components.push(req.user ? req.user.id : 'anonymous');

  const combinedString = components.join('|');

  // Use SHA-256 for a more robust hash
  return crypto.createHash('sha256').update(combinedString).digest('hex');
}

function sortObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  }

  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = sortObject(obj[key]);
      return result;
    }, {});
}
