import RatingService from '../services/rating.service.js';
import ResponseError from '../responses/error.response.js';
import ResponseApi from '../responses/api.response.js';
import * as ratingValidate from '../validate/rating.validate.js';

export default class RatingController {
  constructor() {
    this.service = new RatingService();
  }

  createRating = async (req, res, next) => {
    try {
      const {value, error} = ratingValidate.ratingSchema.validate(req.body);
      if (error) {
        throw new ResponseError(error.message, 400);
      }
      const rating = await this.service.createRating({
        ...value,
        user_id: req.user._id,
      });

      return ResponseApi.success(res, rating);
    } catch (error) {
      next(error);
    }
  };

  getRatingByUserId = async (req, res, next) => {
    try {
      if (!req.user._id) {
        throw new ResponseError('User not found', 404);
      }
      const ratings = await this.service.getRatingByUserId(req.user._id);

      return ResponseApi.success(res, ratings);
    } catch (error) {
      next(error);
    }
  };

  getRatingByInovation = async (req, res, next) => {
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
  };

  deleteRating = async (req, res, next) => {
    try {
      const {value, error} = ratingValidate.ratingIdSchema.validate(req.params);
      if (error) {
        throw new ResponseError(error.message, 400);
      }

      await this.service.deleteRating(value.id);

      return ResponseApi.success(res, 'Rating deleted');
    } catch (error) {
      next(error);
    }
  };

  updateRating = async (req, res, next) => {
    try {
      const {value, error} = ratingValidate.ratingUpdateSchema.validate(
        req.body,
      );
      if (error) {
        throw new ResponseError(error.message, 400);
      }

      const rating = await this.service.updateRating(req.params.id, value);

      return ResponseApi.success(res, rating);
    } catch (error) {
      next(error);
    }
  };
}
