import authRouter from './auth.router.js';
import userRouter from './user.router.js';
import inovationRouter from './inovation.router.js';
import discussionRouter from './discussion.router.js';
import ratingRouter from './rating.router.js';
import whitelistRouter from './whitelist.router.js';

export default function routes(app) {
  app.use('/auth', authRouter());
  app.use('/users', userRouter());
  app.use('/inovations', inovationRouter());
  app.use('/discussions', discussionRouter());
  app.use('/ratings', ratingRouter());
  app.use('/whitelists', whitelistRouter());
}
