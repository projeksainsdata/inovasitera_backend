import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import config from '../config/config.js';

// Simulated token storage. In production, use a database or cache like Redis.
const tokenStorage = new Map();

export const generateUploadToken = (userId, fileType, maxSizeBytes) => {
  const tokenId = crypto.randomBytes(16).toString('hex');
  const tokenPayload = {
    jti: tokenId, // JWT ID
    userId,
    purpose: 'upload',
    fileType,
    maxSizeBytes,
  };
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  // Store the tokenId with a 'used' flag
  tokenStorage.set(tokenId, {used: false});

  return token;
};

export const validateAndConsumeUploadToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== 'upload') {
      return false;
    }

    // Check if the token has already been used
    const tokenStatus = tokenStorage.get(decoded.jti);
    if (!tokenStatus || tokenStatus.used) {
      return false;
    }

    // Mark the token as used
    tokenStorage.set(decoded.jti, {used: true});

    return decoded;
  } catch (error) {
    // Log error for debugging purposes
    console.error('Token validation error:', error);
    return false;
  }
};

class StorageService {
  constructor(storageDir) {
    this.storageDir = storageDir;
  }

  async storeFile(file, filename) {
    try {
      const filePath = path.join(this.storageDir, filename);

      // Ensure the storage directory exists
      await fs.mkdir(this.storageDir, {recursive: true});

      // Write the file to disk
      await fs.writeFile(filePath, file.buffer);

      return filePath;
    } catch (error) {
      console.error('Error storing file:', error);
      throw new Error('Failed to store file');
    }
  }

  async deleteFile(filename) {
    try {
      const filePath = path.join(this.storageDir, filename);
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore the error if the file does not exist
      if (error.code !== 'ENOENT') {
        console.error('Error deleting file:', error);
        throw new Error('Failed to delete file');
      }
    }
  }

  getFileUrl(filename) {
    // Securely construct the file URL
    const baseUrl = config.api.baseUrl;
    return `${baseUrl}/uploads/${encodeURIComponent(filename)}`;
  }
}

export const storageService = new StorageService(config.storage.dir);
