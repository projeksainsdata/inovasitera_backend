import RatingController from '../controllers/rating.controller.js';
import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import createOwnershipMiddleware from '../middlewares/isowner.middleware.js';
import Rating from '../models/rating.model.js';

export default function () {
  const router = express.Router();
  const controller = new RatingController();

  const ratingOwnershipMiddleware = createOwnershipMiddleware(
    Rating,
    'id',
    'user_id',
  );

  router.post('/', authMiddleware, controller.createRating);

  router.get('/user', authMiddleware, controller.getRatingByUserId);

  router.get(
    '/inovation/:inovation_id',
    authMiddleware,
    controller.getRatingByInovation,
  );

  router.delete(
    '/:id',
    authMiddleware,
    ratingOwnershipMiddleware,
    controller.deleteRating,
  );

  return router;
}
