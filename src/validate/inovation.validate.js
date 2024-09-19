import Joi from 'joi';

// SCHEMA INOVATION MODEL
// const inovatationSchema = new Schema(
//     {
//       title: {
//         type: String,
//         required: true
//       },
//       description: {
//         type: String,
//         required: false
//       },
//       category: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Categories'
//       },
//       user_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Users'
//       },
//       status: {
//         type: String,
//         default: 'pending',
//         enum: ['pending', 'approved', 'rejected']
//       },
//       Image: {
//         type: String,
//         required: false
//       },

//       adventage: {
//         type: String,
//         required: false
//       },

//       status_paten: {
//         type: String,
//         required: false
//       },

//       score_tkt: {
//         type: String,
//         required: false
//       },

//       invesment_value: {
//         type: String,
//         required: false
//       },

//       collaboration: {
//         type: [String],
//         required: false
//       },

//       collaboration_details: {
//         type: String,
//         required: false
//       }
//     },
//     { timestamps: true }
//   )

// SCHEMA INOVATION MODEL
export const inovationSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  category: Joi.string().required(),
  user_id: Joi.string().required(),
  status: Joi.string().optional(),
  Image: Joi.string().optional(),
  adventage: Joi.string().optional(),
  status_paten: Joi.string().optional(),
  score_tkt: Joi.string().optional(),
  invesment_value: Joi.string().optional(),
  collaboration: Joi.array().optional(),
  collaboration_details: Joi.string().optional(),
});

export const inovationUpdateSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  category: Joi.string().required(),
  user_id: Joi.string().required(),
  status: Joi.string().optional(),
  Image: Joi.string().optional(),
  adventage: Joi.string().optional(),
  status_paten: Joi.string().optional(),
  score_tkt: Joi.string().optional(),
  invesment_value: Joi.string().optional(),
  collaboration: Joi.array().optional(),
  collaboration_details: Joi.string().optional(),
});

export const inovationIdSchema = Joi.object({
  id: Joi.string().required(),
});

export const inovationQuerySchema = Joi.object({
  page: Joi.number().default(1),
  perPage: Joi.number().default(10),
  q: Joi.string().allow(null, ''),
  sort: Joi.string().default('createdAt'),
  order: Joi.string().default('desc'),
});
