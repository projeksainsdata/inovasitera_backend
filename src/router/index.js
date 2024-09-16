import authRouter from './auth.router.js'

export default function routes(app) {
  app.use('/auth', authRouter())
}
