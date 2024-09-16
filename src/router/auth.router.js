import express from 'express'
import AuthController from '../controllers/auth.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

export default function () {
  const router = express.Router()
  const controller = new AuthController()
  router.post('/register', controller.register)
  router.post('/login', controller.login)
  router.post('/refresh-token', controller.refreshToken)

  router.post('/forgot-password', controller.forgotPassword)
  router.post('/reset-password', controller.resetPassword)

  router.post(
    '/verify-email',
    [authMiddleware],
    controller.sendEmailVerification
  )

  router.post('/resend-email', [authMiddleware], controller.resendEmail)

  router.post('/confirm-email/:token', controller.confirmEmail)

  router.post('/logout', [authMiddleware], controller.logout)

  return router
}
