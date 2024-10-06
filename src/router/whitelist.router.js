import WhitelistController from '../controllers/whitelist.controller.js';
import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';

export default function () {
  const router = express.Router();
  const controller = new WhitelistController();

  router.post('/', authMiddleware, controller.createWhitelist);

  router.get('/user', authMiddleware, controller.getWhitelistByUserId);

  router.delete('/:id', authMiddleware, controller.deleteWhitelist);

  return router;
}
