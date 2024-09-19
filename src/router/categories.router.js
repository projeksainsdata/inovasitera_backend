import CategoriesController from '../controllers/categories.controller.js';
import express from 'express';
import roleMiddleware from '../middlewares/role.middleware.js';

export default function () {
  const router = express.Router();
  const controller = new CategoriesController();

  router.post('/', [roleMiddleware('admin')], controller.createCategory);
  router.get('/', controller.getAllCategories);
  router.get('/:id', controller.getCategoryById);
  router.put('/:id', [roleMiddleware('admin')], controller.updateCategory);
  router.delete('/:id', [roleMiddleware('admin')], controller.deleteCategory);

  return router;
}
