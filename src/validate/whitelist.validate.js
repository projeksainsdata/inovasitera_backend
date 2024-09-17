import Joi from "joi";
// SCHEMA WHITELIST MODEL
// const whitelistSchema = new mongoose.Schema({
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
//     createdAt: {
//       type: Date,
//       default: Date.now
//     }
//   })

export const whitelistSchema = Joi.object({
    user_id: Joi.string().required(),
    inovation_id: Joi.string().required(),
    createdAt: Joi.date().allow(null, ''),
});

export const whitelistUpdateSchema = Joi.object({
    user_id: Joi.string().required(),
    inovation_id: Joi.string().required(),
    createdAt: Joi.date().allow(null, ''),
});

export const whitelistIdSchema = Joi.object({
    id: Joi.string().required(),
});

export const whitelistQuerySchema = Joi.object({
    page : Joi.number().default(1),
    perPage : Joi.number().default(10),
    q: Joi.string().allow(null, ''),
    sort: Joi.string().default('createdAt'),
    order: Joi.string().default('desc')
});
