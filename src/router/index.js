import authRouter from './auth.router.js';
import userRouter from './user.router.js';
import inovationRouter from './inovation.router.js';
import discussionRouter from './discussion.router.js';
import ratingRouter from './rating.router.js';
import whitelistRouter from './whitelist.router.js';
import categoriesRouter from './categories.router.js';
export default function routes(app) {
  app.use('/api/v1', authRouter());
  app.use('/api/v1/users', userRouter());
  app.use('/api/v1/inovations', inovationRouter());
  app.use('/api/v1/discussions', discussionRouter());
  app.use('/api/v1/ratings', ratingRouter());
  app.use('/api/v1/whitelists', whitelistRouter());
  app.use("/api/v1/categories", categoriesRouter());
}
