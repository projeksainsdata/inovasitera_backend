import Joi from "joi";
// SCHEMA RATING MODEL 

// const ratingSchema = new Schema({
//     user_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Users',
//       required: true
//     },
//     inovation_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Inovations',
//       required: true
//     },
  
//     rating: {
//       type: Number,
//       required: true,
//       min: 1,
//       max: 5
//     },
//     comment: {
//       type: String,
//       required: false
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now
//     }
//   })


export const ratingSchema = Joi.object({
    user_id: Joi.string().required(),
    inovation_id: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().allow(null, ''),
    createdAt: Joi.date().allow(null, ''),
});

export const ratingUpdateSchema = Joi.object({
    user_id: Joi.string().required(),
    inovation_id: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().allow(null, ''),
    createdAt: Joi.date().allow(null, ''),
});

export const ratingIdSchema = Joi.object({
    id: Joi.string().required(),
});

export const ratingQuerySchema = Joi.object({
    page : Joi.number().default(1),
    perPage : Joi.number().default(10),
    q: Joi.string().allow(null, ''),
    sort: Joi.string().default('rating'),
    order: Joi.string().default('desc')
});

