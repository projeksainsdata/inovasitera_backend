import DiscussionController from '../controllers/discussion.controller.js';
import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import createOwnershipMiddleware from '../middlewares/isowner.middleware.js';
import Discussion from '../models/discussion.model';

export default function () {
  const router = express.Router();
  const controller = new DiscussionController();

  const discussionOwnershipMiddleware = createOwnershipMiddleware({
    model: Discussion,
    idParam: 'id',
    ownerField: 'user_id',
  });

  router.post('/', authMiddleware, controller.createDiscussion);

  router.get('/:id', authMiddleware, controller.getDiscussionById);

  router.get('/user', authMiddleware, controller.getDiscussionByUserId);

  router.get(
    '/inovation/:inovation_id',
    authMiddleware,
    controller.getDiscussionByInovation,
  );

  router.put(
    '/:id',
    authMiddleware,
    discussionOwnershipMiddleware,
    controller.updateDiscussion,
  );

  router.delete(
    '/:id',
    authMiddleware,
    discussionOwnershipMiddleware,
    controller.deleteDiscussion,
  );

  router.get('/:id/replies', authMiddleware, controller.getReplies);

  return router;
}
