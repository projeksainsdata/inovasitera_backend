import userController from '../controllers/user.controller.js';
import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import createOwnershipMiddleware from '../middlewares/isowner.middleware.js';
import User from '../models/user.model.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import ROLE, {ROLE_PERMISSION} from '../enum/role.enum.js';

export default function userRouter() {
  const router = express.Router();
  const controller = new userController();

  const userOwnershipMiddleware = createOwnershipMiddleware(User, 'id', '_id');

  router.get(
    '/',
    [authMiddleware, roleMiddleware(ROLE_PERMISSION[ROLE.ADMIN])],
    controller.searchUser,
  );

  router.get('/:id', authMiddleware, controller.getUserById);

  router.put(
    '/:id',
    authMiddleware,
    userOwnershipMiddleware,
    controller.updateUser,
  );
  router.patch(
    '/:id',
    authMiddleware,
    userOwnershipMiddleware,
    controller.updateUser,
  );

  router.delete(
    '/:id',
    authMiddleware,
    userOwnershipMiddleware,
    controller.deleteUser,
  );

  return router;
}
