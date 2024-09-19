import Joi from 'joi'

// SCHEMA users model
// const userSchema = new Schema({
//   role: {
//     type: String,
//     default: ROLE.MEMBER,
//     enum: [ROLE.ADMIN, ROLE.INOVATOR, ROLE.MEMBER]
//   },
//   fullname: {
//     type: String,
//     required: true
//   },
//   username: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   email: {
//     type: String,
//     required: true
//   },
//   password: {
//     type: String,
//     required: false
//   },
//   provider: {
//     type: String,
//     default: 'local'
//   },

//   profile: {
//     type: String,
//     // get a random profile image from dicebear

//     default: () => {
//       return `https://api.dicebear.com/9.x/${
//         profile_imgs_collections_list[
//           Math.floor(Math.random() * profile_imgs_collections_list.length)
//         ]
//       }/svg?seed=${
//         profile_imgs_name_list[
//           Math.floor(Math.random() * profile_imgs_name_list.length)
//         ]
//       }`
//     }
//   },

//   address: {
//     type: String,
//     default: ''
//   },
//   phonenumber: {
//     type: String,
//     default: ''
//   },

//   //  password management
//   forgotPassword: {
//     type: String,
//     default: ''
//   },
//   resetPassword: {
//     type: String,
//     default: ''
//   },

//   inovator: {
//     unit: {
//       type: String,
//       default: ''
//     },
//     fields: {
//       type: Array,
//       default: []
//     },
//     itera_fakultas: {
//       type: String,
//       default: ''
//     },
//     itera_prodi: {
//       type: String,
//       default: ''
//     }
//   }
// })

// SCHEMA users model

export const userSchema = Joi.object({
  role: Joi.string().default('member').valid('admin', 'inovator', 'member'),
  fullname: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  provider: Joi.string().default('local'),
  profile: Joi.string().default(
    'https://api.dicebear.com/9.x/avatars/1.svg?seed=1'
  ),
  address: Joi.string().default(''),
  phonenumber: Joi.string().default(''),
  forgotPassword: Joi.string().default(''),
  resetPassword: Joi.string().default(''),
  inovator: Joi.object({
    unit: Joi.string().default(''),
    fields: Joi.array().default([]),
    itera_fakultas: Joi.string().default(''),
    itera_prodi: Joi.string().default('')
  })
})

export const userUpdateSchema = Joi.object({
  role: Joi.string().valid('admin', 'inovator', 'member'),
  fullname: Joi.string(),
  username: Joi.string(),
  email: Joi.string(),
  password: Joi.string(),
  provider: Joi.string(),
  profile: Joi.string(),
  address: Joi.string(),
  phonenumber: Joi.string(),
  forgotPassword: Joi.string(),
  resetPassword: Joi.string(),
  inovator: Joi.object({
    unit: Joi.string(),
    fields: Joi.array(),
    itera_fakultas: Joi.string(),
    itera_prodi: Joi.string()
  })
})

export const userLoginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required()
})

export const userRegisterSchema = Joi.object({
  fullname: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.ref('password')
})

export const userChangePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
  confirmPassword: Joi.ref('newPassword')
})

export const userForgotPasswordSchema = Joi.object({
  email: Joi.string().required()
})
export const userResetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().required(),
  password2: Joi.ref('password')
})

export const userQuerySchema = Joi.object({
  page: Joi.number().default(1),
  perPage: Joi.number().default(10),
  q: Joi.string().allow(''),
  sort: Joi.string().default('createdAt'),
  order: Joi.string().default('desc')
})
