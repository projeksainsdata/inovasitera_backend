// utils/jwtUtil.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = '30m'; // 30 minute

import ResponseError from '../responses/error.response.js';

export const generateUploadToken = (userId) => {
  return jwt.sign({userId, purpose: 'upload'}, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  });
};

export const verifyUploadToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.purpose !== 'upload') {
      throw new ResponseError(400, 'Invalid upload token');
    }
    return decoded.userId;
  } catch {
    throw new ResponseError(400, 'Invalid upload token');
  }
};
