import WhitelistService from '../services/whitelist.service.js';
import ResponseError from '../responses/error.response.js';
import ResponseApi from '../responses/api.response.js';
import * as whitelistValidate from '../validate/whitelist.validate.js';

export default class WhitelistController {
  constructor() {
    this.service = new WhitelistService();
  }

  createWhitelist = async (req, res, next) => {
    try {
      const {value, error} = whitelistValidate.whitelistSchema.validate({
        ...req.body,
        user_id: req.user._id,
      });
      if (error) {
        throw new ResponseError(error.message, 400);
      }

      const whitelist = await this.service.createWhitelist(value);

      return ResponseApi.success(res, whitelist);
    } catch (error) {
      next(error);
    }
  };

  getWhitelistByUserId = async (req, res, next) => {
    try {
      if (!req.user._id) {
        throw new ResponseError('User not found', 404);
      }

      const whitelists = await this.service.getWhitelistByUserId(req.user._id);

      return ResponseApi.success(res, whitelists);
    } catch (error) {
      next(error);
    }
  };

  deleteWhitelist = async (req, res, next) => {
    try {
      const {value, error} = whitelistValidate.whitelistIdSchema.validate(
        req.params,
      );
      if (error) {
        throw new ResponseError(error.message, 400);
      }

      const whitelist = await this.service.deleteWhitelist(value.id);

      return ResponseApi.noContent(res, whitelist);
    } catch (error) {
      next(error);
    }
  };
}
