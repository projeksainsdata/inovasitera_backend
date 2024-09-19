import CategoriesController from '../controllers/categories.controller.js';
import express from 'express';
import roleMiddleware from '../middlewares/role.middleware.js';
import ROLE, {ROLE_PERMISSION} from '../enum/role.enum.js';
export default function () {
  const router = express.Router();
  const controller = new CategoriesController();

  router.post(
    '/',
    [roleMiddleware(ROLE_PERMISSION[ROLE.ADMIN])],
    controller.createCategory,
  );
  router.get('/', controller.getAllCategories);
  router.get('/:id', controller.getCategoryById);
  router.put(
    '/:id',
    [roleMiddleware(ROLE_PERMISSION[ROLE.ADMIN])],
    controller.updateCategory,
  );
  router.delete(
    '/:id',
    [roleMiddleware(ROLE_PERMISSION[ROLE.ADMIN])],
    controller.deleteCategory,
  );

  return router;
}
