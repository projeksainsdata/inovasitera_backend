import Joi from 'joi'

export const userRegisterSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().required()
})

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

export const userForgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
})

export const userResetPasswordSchema = Joi.object({
  password: Joi.string().required(),
  password2: Joi.ref('password'),
  token: Joi.string().required()
})

export const userUpdateSchema = Joi.object({
  username: Joi.string().allow(''),

  newPassword: Joi.string().allow(''),
  confirmPassword: Joi.string().allow(''),
  currentPassword: Joi.string().allow(''),

  fullname: Joi.string().allow(''),
  address: Joi.string().allow(''),
  phonenumber: Joi.string().allow(''),
  profile: Joi.string().allow('')
})

export const searchUserSchema = Joi.object({
  username: Joi.string().allow(''),
  email: Joi.string().allow(''),
  role: Joi.string().allow(''),
  perPage: Joi.number().allow(''),
  page: Joi.number().allow('')
})
