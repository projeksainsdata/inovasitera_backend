import mongoose from 'mongoose';
import ROLES from '../enum/role.enum.js';
import ResponseError from '../responses/error.response.js';
/**
 * Factory function to create middleware for checking if the authenticated user
 * is the owner of a resource or has admin privileges.
 *
 * @param {Object} options - Configuration options
 * @param {mongoose.Model} options.model - Mongoose model to query
 * @param {string} options.idParam - Name of the route parameter containing the resource ID
 * @param {string} options.ownerField - Field in the model that references the owner (default: 'createdBy')
 * @param {Function} options.customCheck - Optional custom check function
 * @returns {Function} Express middleware function
 */
const createOwnershipMiddleware = (
  model,
  idParam = 'id',
  ownerField = 'user_id',
  customCheck,
) => {
  
  if (!model || !(model.prototype instanceof mongoose.Model)) {
    throw new ResponseError("Invalid 'model' option", 500);
  }

  return async (req, res, next) => {
    try {
      
      const resourceId = req.params[idParam];

      if (!resourceId) {
        throw new ResponseError('Resource ID not provided', 400);
      }

      const resource = await model.findById(resourceId);

      if (!resource) {
        throw new ResponseError('Resource not found', 404);
      }

      // Check if user is admin
      if (req.user.role === ROLES.ADMIN) {
        req.resource = resource;
        return next();
      }

      // Check ownership
      const isOwner =
        resource[ownerField] && resource[ownerField].equals(req.user._id);

      if (isOwner) {
        req.resource = resource;
        return next();
      }

      // Run custom check if provided
      if (customCheck && (await customCheck(req.user, resource))) {
        req.resource = resource;
        return next();
      }

      throw new ResponseError('Access denied', 403);
    } catch (error) {
      next(error);
    }
  };
};

export default createOwnershipMiddleware;
