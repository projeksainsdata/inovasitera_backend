import InovationController from '../controllers/inovation.controller.js';
import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

import createOwnershipMiddleware from '../middlewares/isowner.middleware.js';
import InovationModel from '../models/inovation.model.js';

import ROLE, {ROLE_PERMISSION} from '../enum/role.enum';
export default function () {
  const router = express.Router();
  const controller = new InovationController();

  const inovationOwnershipMiddleware = createOwnershipMiddleware(
    InovationModel,
    'id',
    'user_id',
  );

  router.post(
    '/',
    authMiddleware,
    roleMiddleware(ROLE_PERMISSION[ROLE.INOVATOR]),
    controller.createInovation,
  );

  router.get('/:id', authMiddleware, controller.getInovation);

  router.put(
    '/:id',
    authMiddleware,
    roleMiddleware(ROLE_PERMISSION[ROLE.INOVATOR]),
    inovationOwnershipMiddleware,
    controller.updateInovation,
  );

  router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware(ROLE_PERMISSION[ROLE.ADMIN]),
    inovationOwnershipMiddleware,
    controller.deleteInovation,
  );

  return router;
}
