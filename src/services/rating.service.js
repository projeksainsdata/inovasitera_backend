import RatingModel from '../models/rating.model.js';
import ResponseError from '../responses/error.response.js';

export default class RatingService {
  async createRating(rating) {
    try {
      return await RatingModel.create(rating);
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async getRatingByUserId(id) {
    return await RatingModel.find({user_id: id});
  }

  async getRatingByInovation(inovation_id) {
    return await RatingModel.find({inovation_id: inovation_id});
  }

  async deleteRating(id) {
    return await RatingModel.findByIdAndDelete(id);
  }

  async updateRating(id, rating) {
    return await RatingModel.findByIdAndUpdate(
      id,
      {
        $set: rating,
      },
      {new: true},
    );
  }
}
