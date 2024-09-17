import Joi from 'joi'

// SCHEMA DISCUSSION MODEL

// const discussionSchema = new Schema(
//     {
//       inovation_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Inovations'
//       },
//       user_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Users'
//       },
//       content: {
//         type: String,
//         required: true
//       },
//       parent_discussion_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Discussions'
//       }
//     },
//     { timestamps: true }
//   )\

export const discussionSchema = Joi.object({
  inovation_id: Joi.string().required(),
  user_id: Joi.string().required(),
  content: Joi.string().required(),
  parent_discussion_id: Joi.string().allow(null, ''),
  createdAt: Joi.date().allow(null, '')
})

export const discussionUpdateSchema = Joi.object({
  inovation_id: Joi.string().required(),
  user_id: Joi.string().required(),
  content: Joi.string().required(),
  parent_discussion_id: Joi.string().allow(null, ''),
  createdAt: Joi.date().allow(null, '')
})

export const discussionIdSchema = Joi.object({
  id: Joi.string().required()
})

export const discussionQuerySchema = Joi.object({
  page: Joi.number().default(1),
  perPage: Joi.number().default(10),
  q: Joi.string().allow(null, ''),
  sort: Joi.string().default('createdAt'),
  order: Joi.string().default('desc')
})
