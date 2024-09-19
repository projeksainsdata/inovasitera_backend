import logger from '../application/logger.js';
import uuid from '../utils/uuid.js';
export default class ResponseError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status || status | 500;
    this.message = message;
    this.requestTime = new Date().toISOString();
    this.requestId = uuid();
    this.log();
  }

  log() {
    logger.error(
      `Request ID: ${this.requestId} - Request Time: ${this.requestTime} - Message: ${this.message} - Status: ${this.status}`,
    );
  }

  static badRequest(error) {
    return new ResponseError(error, 400);
  }

  static unauthorized(message) {
    return new ResponseError(message, 401);
  }

  static forbidden(message) {
    return new ResponseError(message, 403);
  }

  static notFound(message) {
    return new ResponseError(message, 404);
  }

  static conflict(message) {
    return new ResponseError(message, 409);
  }

  static unprocessableEntity(message) {
    return new ResponseError(message, 422);
  }

  static internalServerError(message) {
    return new ResponseError(message, 500);
  }

  static notImplemented(message) {
    return new ResponseError(message, 501);
  }

  static badGateway(message) {
    return new ResponseError(message, 502);
  }

  static serviceUnavailable(message) {
    return new ResponseError(message, 503);
  }

  static gatewayTimeout(message) {
    return new ResponseError(message, 504);
  }

  toJson() {
    return {
      requestTime: this.requestTime,
      requestId: this.requestId,
      status: this.status,
      message: this.message,
    };
  }
}
