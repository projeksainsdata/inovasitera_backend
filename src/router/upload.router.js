import UploadController from '../controllers/upload.controller.js';
import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import createOwnershipMiddleware from '../middlewares/isowner.middleware.js';

import UploadModel from '../models/files.model.js';

export default function () {
  const router = express.Router();
  const controller = new UploadController();

  const uploadOwnershipMiddleware = createOwnershipMiddleware(
    UploadModel,
    'id',
    'user_id',
  );

  router.post('/', authMiddleware, controller.upload);
  router.post('/token', authMiddleware, controller.generateUploadToken);

  router.post('/batch', authMiddleware, controller.uploadBatch);

  router.delete(
    '/:id',
    authMiddleware,
    uploadOwnershipMiddleware,
    controller.delete,
  );

  return router;
}
