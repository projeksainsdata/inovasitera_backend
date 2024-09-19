// create middleware error handler for express app

// Path: app\src\middleware\midlleware.error.js
import ResponseError from '../responses/error.response.js';
export default function errorHandler(err, req, res) {
  if (err instanceof ResponseError) {
    return res.status(err.status).json(err.toJson());
  }
  return res.status(500).json(new ResponseError(err.message, 500).toJson());
}
