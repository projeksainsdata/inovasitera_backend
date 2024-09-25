import CategoriesController from '../controllers/categories.controller.js';
import express from 'express';
import roleMiddleware from '../middlewares/role.middleware.js';
import ROLE, {ROLE_PERMISSION} from '../enum/role.enum.js';
import authMiddleware from '../middlewares/auth.middleware.js';
export default function () {
  const router = express.Router();
  const controller = new CategoriesController();

  router.get('/', controller.searchCategories);
  router.post(
    '/',
    authMiddleware,
    [roleMiddleware(ROLE_PERMISSION[ROLE.ADMIN])],
    controller.createCategory,
  );
  router.get('/:id', controller.getCategoryById);
  router.put(
    '/:id',
    authMiddleware,
    [roleMiddleware(ROLE_PERMISSION[ROLE.ADMIN])],
    controller.updateCategory,
  );
  router.delete(
    '/:id',
    authMiddleware,
    [roleMiddleware(ROLE_PERMISSION[ROLE.ADMIN])],
    controller.deleteCategory,
  );

  return router;
}
