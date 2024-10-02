import UploadController from '../controllers/upload.controller.js';
import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import createOwnershipMiddleware from '../middlewares/isowner.middleware.js';

import FileMetadata from '../models/files.model.js';

export default function () {
  const router = express.Router();
  const controller = new UploadController();

  const uploadOwnershipMiddleware = createOwnershipMiddleware(
    FileMetadata,
    'id',
    'uploadedBy',
  );

  router.post('/token', authMiddleware, controller.generateUploadToken);
  router.post('/request-url', authMiddleware, controller.requestPresignedUrl);
  router.post('/confirm', authMiddleware, controller.confirmUpload);

  router.delete(
    '/:imageId',
    authMiddleware,
    uploadOwnershipMiddleware,
    controller.deleteImage,
  );

  return router;
}
