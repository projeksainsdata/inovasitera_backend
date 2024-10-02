// validators.js
import Joi from 'joi';

export const fileTypeSchema = Joi.string().regex(/^image\/.+$/);

export const metadataSchema = Joi.object({
  filename: Joi.string().min(1).max(255).required(),
  contentType: Joi.string()
    .regex(/^image\/.+$/)
    .required(),
  size: Joi.number()
    .positive()
    .max(10 * 1024 * 1024)
    .required(), // Max 10MB
});

export const validateFileType = (fileType) => {
  const {error} = fileTypeSchema.validate(fileType);
  if (error) {
    return false;
  }
  return true;
};

export const validateMetadata = (metadata) => {
  const {error} = metadataSchema.validate(metadata);
  if (error) {
    return false;
  }
  return true;
};

export const uploadTokenSchema = Joi.object({
  token: Joi.string().uuid().required(),
  userId: Joi.string().required(),
});

export const validateUploadToken = (token, userId) => {
  const {error} = uploadTokenSchema.validate({token, userId});
  if (error) {
    return false;
  }
  return true;
};
