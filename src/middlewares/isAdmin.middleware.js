import ResponseError from '../responses/error.response.js';
export default function isAdminMiddleware(req, res, next) {
  try {
    const users = req.user;
    // check role of user is admin or not
    if (users.role !== 'admin') {
      throw new ResponseError('Forbidden Access denied', 403);
    }

    next();
  } catch (err) {
    next(err);
  }
}
