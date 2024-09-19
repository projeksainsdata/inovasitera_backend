import UserService from '../services/user.service.js';
import ResponseError from '../responses/error.response.js';

const userService = new UserService();

const roleMiddleware = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id; // Assuming user ID is stored in req.user
      const user = await userService.findById(userId);

      if (!user) {
        throw new ResponseError('User not found', 404);
      }

      if (user.role !== requiredRole) {
        throw new ResponseError(
          'Access denied. Insufficient permissions.',
          403,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default roleMiddleware;
