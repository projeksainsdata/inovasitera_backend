import AuthService from '../services/auth.service.js';
import ResponseError from '../responses/error.response.js';

export default function authMiddleware(req, res, next) {
  try {
    let token;
    if (req.cookies && req.cookies.access) {
      token = req.cookies.access;
    } else if (req.headers.authorization) {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ResponseError('Invalid access token format', 401);
      }
      token = authHeader.split(' ')[1];
    } else {
      throw new ResponseError('Access denied', 401);
    }

    const decoded = AuthService.verify(token);
    req.user = decoded.user;

    next();
  } catch (err) {
    next(err);
  }
}
