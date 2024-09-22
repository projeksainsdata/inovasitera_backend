import WhitelistController from '../controllers/whitelist.controller.js';
import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import createOwnershipMiddleware from '../middlewares/isowner.middleware.js';
import WhitelistModel from '../models/whitelist.model.js';

export default function () {
  const router = express.Router();
  const controller = new WhitelistController();

  const whitelistOwnershipMiddleware = createOwnershipMiddleware(
    WhitelistModel,
    'id',
    'user_id',
  );

  router.post('/', authMiddleware, controller.createWhitelist);

  router.get('/user', authMiddleware, controller.getWhitelistByUserId);

  router.delete(
    '/:id',
    authMiddleware,
    whitelistOwnershipMiddleware,
    controller.deleteWhitelist,
  );

  router.put(
    '/:id',
    authMiddleware,
    whitelistOwnershipMiddleware,
    controller.updateWhitelist,
  );

  router.patch(
    '/:id',
    authMiddleware,
    whitelistOwnershipMiddleware,
    controller.updateWhitelist,
  );

  return router;
}
