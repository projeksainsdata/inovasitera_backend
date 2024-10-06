// routes/dashboardRoutes.js
import express from 'express';
import DashboardController from '../controllers/dashboard.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import ROLE, {ROLE_PERMISSION} from '../enum/role.enum.js';

export default function () {
  const router = express.Router();
  const controller = DashboardController;

  router.get(
    '/innovation',
    authMiddleware,
    roleMiddleware(ROLE_PERMISSION[ROLE.ADMIN]),
    controller.getInnovationOverview,
  );
  router.get(
    '/user',
    authMiddleware,
    roleMiddleware(ROLE_PERMISSION[ROLE.ADMIN]),
    controller.getUserAnalytics,
  );

  return router;
}
