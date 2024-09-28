import ResponseError from '../responses/error.response.js';
import ResponseApi from '../responses/api.response.js';
import * as ratingValidate from '../validate/rating.validate.js';
import InovationService from '../services/inovation.service.js';

export default class RatingController {
  constructor() {
    this.service = new InovationService();
  }
  async createRating(req, res, next) {
    try {
      const user_id = req.user._id;
      const {value, error} = ratingValidate.ratingSchema.validate({
        ...req.body,
        user_id,
      });
      if (error) {
        throw new ResponseError(error.message, 400);
      }
      const rating = await this.service.createRatingInovation(value);

      return ResponseApi.success(res, rating);
    } catch (error) {
      next(error);
    }
  }

  async getRatingByUserId(req, res, next) {
    try {
      if (!req.user._id) {
        throw new ResponseError('User not found', 404);
      }
      const ratings = await this.service.getRatingByUserId(req.user._id);

      return ResponseApi.success(res, ratings);
    } catch (error) {
      next(error);
    }
  }

  async getRatingByInovation(req, res, next) {
    try {
      if (!req.params.inovation_id) {
        throw new ResponseError('Inovation not found', 404);
      }

      const ratings = await this.service.getRatingByInovation(
        req.params.inovation_id,
      );

      return ResponseApi.success(res, ratings);
    } catch (error) {
      next(error);
    }
  }

  async deleteRating(req, res, next) {
    try {
      const {value, error} = ratingValidate.ratingIdSchema.validate(req.params);
      if (error) {
        throw new ResponseError(error.message, 400);
      }

      await this.service.deleteRatingbyRating_id(value.id);

      return ResponseApi.noContent(res, 'Rating deleted');
    } catch (error) {
      next(error);
    }
  }
}
