import Joi from 'joi';

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
  collaboration: Joi.array(),
  adventage: Joi.string().optional(),
  user_id: Joi.string().required(),

  //image
  images: Joi.array(),
  thumbnail: Joi.string().required(),

  //inovation details
  development_stage: Joi.string().optional(),
  status_paten: Joi.string().optional(),
  score_tkt: Joi.string().optional(),
  collaboration_details: Joi.string().optional(),

  // inovation status
  status: Joi.string().default('pending'),

  // inovation investment
  faq: Joi.array(),
});

export const inovationUpdateSchema = Joi.object({
  title: Joi.string().allow('', null),
  description: Joi.string().allow('', null),
  category: Joi.string().allow('', null),
  adventage: Joi.string().allow('', null),
  collaboration: Joi.array(),

  //image
  images: Joi.array(),
  thumbnail: Joi.string().allow('', null),

  //inovation details
  development_stage: Joi.string().allow('', null),
  status_paten: Joi.string().allow('', null),
  score_tkt: Joi.string().allow('', null),
  collaboration_details: Joi.string().allow('', null),

  // inovation status
  status: Joi.string().allow('', null),

  // inovation investment
  faq: Joi.array(),
});

export const inovationIdSchema = Joi.object({
  id: Joi.string().required(),
});

export const inovationQuerySchema = Joi.object({
  page: Joi.number().default(1),
  perPage: Joi.number().default(10),
  q: Joi.string().allow(null, ''),
  category: Joi.string().allow(null, ''),
  sort: Joi.string().default('createdAt'),
  order: Joi.string().default('desc'),
});

export const inovationAdminQuerySchema = Joi.object({
  page: Joi.number().default(1),
  perPage: Joi.number().default(10),
  q: Joi.string().allow(null, ''),
  category: Joi.string().allow(null, ''),
  status: Joi.string().allow(null, ''),
  sort: Joi.string().default('createdAt'),
  order: Joi.string().default('desc'),
});

export const inovationInovatorQuerySchema = Joi.object({
  page: Joi.number().default(1),
  perPage: Joi.number().default(10),
  q: Joi.string().allow(null, ''),
  category: Joi.string().allow(null, ''),
  status: Joi.string().allow(null, ''),
  sort: Joi.string().default('createdAt'),
  order: Joi.string().default('desc'),
});
