import Joi from 'joi';

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
//     fakultas: {
//       type: String,
//       default: ''
//     },
//     prodi: {
//       type: String,
//       default: ''
//     }
//   }
// })

// SCHEMA users model

export const userSchema = Joi.object({
  role: Joi.string().default('member').valid('innovator', 'member'),
  fullname: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  provider: Joi.string().default('local'),
  profile: Joi.string(),
  address: Joi.string().default(''),
  phonenumber: Joi.string().default(''),
  gender: Joi.string().default(''),
  dateOfBirth: Joi.string().default(''),
  inovator: Joi.object({
    unit: Joi.string().default(''),
    fields: Joi.array().default([]),
    fakultas: Joi.string().default(''),
    prodi: Joi.string().default(''),
    status: Joi.string()
      .default('pending')
      .valid('pending', 'active', 'inactive'),
  }),
});

export const userUpdateSchema = Joi.object({
  role: Joi.string().valid('innovator', 'member', 'admin').allow(''),
  fullname: Joi.string().allow(''),
  username: Joi.string().allow(''),
  email: Joi.string().allow(''),
  password: Joi.string().allow(''),
  provider: Joi.string().allow(''),
  profile: Joi.string().allow(''),
  address: Joi.string().allow(''),
  phonenumber: Joi.string().allow(''),
  forgotPassword: Joi.string().allow(''),
  resetPassword: Joi.string().allow(''),
  inovator: Joi.object({
    unit: Joi.string().allow(''),
    fields: Joi.array(),
    fakultas: Joi.string().allow(''),
    prodi: Joi.string().allow(''),
    status: Joi.string().valid('pending', 'active', 'inactive').allow(''),
  }),
  gender: Joi.string().allow(''),
  dateOfBirth: Joi.string().allow(''),

  // change password
  currentPassword: Joi.string().allow(''),
  newPassword: Joi.string().allow(''),
  confirmNewPassword: Joi.string().allow(''),
});

export const userUpdatePasswordSchema = Joi.object({
  newPassword: Joi.string().required(),
  confirmNewPassword: Joi.string().required().valid(Joi.ref('newPassword')),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

export const userRegisterSchema = Joi.object({
  role: Joi.string().valid('innovator', 'member').default('member'),
  fullname: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().required(),
  gender: Joi.string(),
  dateOfBirth: Joi.string(),
  phonenumber: Joi.string(),
  inovator: Joi.object({
    unit: Joi.string().allow(''),
    fields: Joi.array(),
    fakultas: Joi.string().allow(''),
    prodi: Joi.string().allow(''),
  }),
  password: Joi.string().required(),
  confirmPassword: Joi.ref('password'),
});

export const userChangePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
  confirmPassword: Joi.ref('newPassword'),
});

export const userForgotPasswordSchema = Joi.object({
  email: Joi.string().required(),
});
export const userResetPasswordSchema = Joi.object({
  password: Joi.string().required(),
  password2: Joi.ref('password'),
});

export const userQuerySchema = Joi.object({
  page: Joi.number().default(1),
  perPage: Joi.number().default(10),
  q: Joi.string().allow(''),
  role: Joi.string().valid('innovator', 'member', 'admin').allow(''),
  status: Joi.string().valid('pending', 'active', 'inactive').allow(''),
  sort: Joi.string().default('createdAt'),
  order: Joi.string().default('desc'),
});
