import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import uuid from '../utils/uuid.js';

export const generateUploadToken = (userId, fileType, maxSizeBytes) => {
  const tokenId = crypto.randomBytes(16).toString('hex');
  const token = jwt.sign(
    {
      userId,
      purpose: 'upload',
      tokenId,
      fileType,
      maxSizeBytes,
    },
    process.env.JWT_SECRET,
    {expiresIn: '1h'},
  );

  // Store the tokenId in your database or cache (e.g., Redis)
  // This is just a placeholder. Use your actual database or cache.
  // tokenStorage.set(tokenId, { used: false });

  return token;
};

export const validateAndConsumeUploadToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== 'upload') return false;

    // Check if token has been used
    // This is a placeholder. Use your actual database or cache.
    // const tokenStatus = await tokenStorage.get(decoded.tokenId);
    // if (tokenStatus.used) return false;

    // Mark token as used
    // await tokenStorage.set(decoded.tokenId, { used: true });

    return decoded;
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    return false;
  }
};

class StorageService {
  constructor(storageDir) {
    this.storageDir = storageDir;
  }

  async storeFile(file, filename) {
    const filePath = path.join(this.storageDir, filename);
    await fs.writeFile(filePath, file.buffer);
    return filePath;
  }

  async deleteFile(filename) {
    const filePath = path.join(this.storageDir, filename);
    await fs.unlink(filePath);
  }

  getFileUrl(filename) {
    // This could be a local path or a CDN URL depending on your setup
    return `/uploads/${filename}`;
  }
}

export const processUpload = async (file) => {
  const fileExtension = path.extname(file.originalname);
  const fileName = `${uuid()}${fileExtension}`;

  const filePath = await storageService.storeFile(file, fileName);
  const fileUrl = storageService.getFileUrl(fileName);

  // Here you could add additional processing like image resizing

  return {fileName, filePath, fileUrl};
};

export const storageService = new StorageService(process.env.STORAGE_DIR);
