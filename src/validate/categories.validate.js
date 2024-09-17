import Joi from "joi";

// SCHEMA CATEGORIES MODEL
// const categorySchema = new Schema({
//     name: {
//       type: String,
//       required: true
//     },
//     description: {
//       type: String,
//       required: false
//     },
//     image: {
//       type: String,
//       required: false
//     }
//   })
  
export const categorySchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(null, ''),
    image: Joi.string().allow(null, ''),
});

export const categoryUpdateSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(null, ''),
    image: Joi.string().allow(null, ''),
});

export const categoryIdSchema = Joi.object({
    id: Joi.string().required(),
});

export const categoryQuerySchema = Joi.object({
    page : Joi.number().default(1),
    perPage : Joi.number().default(10),
    q: Joi.string().allow(null, ''),
    sort: Joi.string().default('name'),
    order: Joi.string().default('desc')
});
