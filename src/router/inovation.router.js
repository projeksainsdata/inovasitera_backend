import InovationController from '../controllers/inovation.controller.js';
import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

import createOwnershipMiddleware from '../middlewares/isowner.middleware.js';
import InovationModel from '../models/inovation.model.js';

import ROLE, {ROLE_PERMISSION} from '../enum/role.enum.js';
export default function () {
  const router = express.Router();
  const controller = new InovationController();

  const inovationOwnershipMiddleware = createOwnershipMiddleware(
    InovationModel,
    'id',
    'user_id',
  );
  router.get('/', controller.searchInovation);
  router.get(
    '/admin',
    authMiddleware,
    roleMiddleware(ROLE_PERMISSION[ROLE.ADMIN]),
    controller.searchAdminInovation,
  );
  router.get(
    '/user',
    authMiddleware,
    roleMiddleware(ROLE_PERMISSION[ROLE.INOVATOR]),
    controller.searchUserInovation,
  );
  router.get('/:id', controller.getInovation);

  router.post(
    '/',
    authMiddleware,
    roleMiddleware(ROLE_PERMISSION[ROLE.INOVATOR]),
    controller.createInovation,
  );

  router.put(
    '/:id',
    authMiddleware,
    roleMiddleware(ROLE_PERMISSION[ROLE.INOVATOR]),
    inovationOwnershipMiddleware,
    controller.updateInovation,
  );

  router.patch(
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
