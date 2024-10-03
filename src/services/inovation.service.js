// inovationService.js
import InovationModel from '../models/inovation.model.js';
import ResponseError from '../responses/error.response.js';

export default class InovationService {
  async createInovation(data) {
    try {
      return await InovationModel.create(data);
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async findById(id) {
    try {
      return await InovationModel.findById(id)
        .populate('category', 'name')
        .populate('rating.user_id', 'fullname profile')
        .lean();
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async updateInovation(id, data) {
    try {
      return await InovationModel.findByIdAndUpdate(
        id,
        {$set: data},
        {new: true},
      ).lean();
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async searchUserInovation(
    user_id,
    {
      page = 1,
      perPage = 10,
      q,
      sort = 'createdAt',
      order = 'desc',
      category,
      status,
    },
  ) {
    try {
      const query = {user_id};

      if (q) {
        query.$or = [
          {title: {$regex: q, $options: 'i'}},
          {description: {$regex: q, $options: 'i'}},
        ];
      }

      if (status) {
        query.status = status;
      }

      if (category) {
        query['category.name'] = category;
      }

      const inovationQuery = InovationModel.find(query)
        .populate('category', 'name')
        .sort({[sort]: order === 'desc' ? -1 : 1})
        .skip((page - 1) * perPage)
        .limit(perPage)
        .select('Image title status category createdAt')
        .lean();

      const [inovations, count] = await Promise.all([
        inovationQuery,
        InovationModel.countDocuments(query),
      ]);

      // Calculate average rating for each innovation
      const processedInovations = inovations.map((inov) => ({
        ...inov,
        average_rating: inov.rating
          ? inov.rating.reduce((acc, r) => acc + r.rating, 0) /
            inov.rating.length
          : 0,
        count_rating: inov.rating ? inov.rating.length : 0,
      }));

      return {inovations: processedInovations, count};
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async searchInovation({
    page = 1,
    perPage = 10,
    q,
    sort = 'createdAt',
    order = 'desc',
    category,
  }) {
    try {
      const query = {status: 'approved'};

      if (q) {
        query.$or = [
          {title: {$regex: q, $options: 'i'}},
          {description: {$regex: q, $options: 'i'}},
        ];
      }

      if (category) {
        query['category.name'] = category;
      }

      const inovationQuery = InovationModel.find(query)
        .populate('category', 'name')
        .populate('rating')
        .sort({[sort]: order === 'desc' ? -1 : 1})
        .skip((page - 1) * perPage)
        .limit(perPage)
        .select('thumbnail title category rating')
        .lean();

      const [inovations, count] = await Promise.all([
        inovationQuery,
        InovationModel.countDocuments(query),
      ]);

      // Process ratings
      const processedInovations = inovations.map((inov) => ({
        ...inov,
        average_rating: inov.rating
          ? inov.rating.reduce((acc, r) => acc + r.rating, 0) /
            inov.rating.length
          : 0,
        count_rating: inov.rating ? inov.rating.length : 0,
      }));

      return {inovations: processedInovations, count};
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async createRatingInovation({inovation_id, ...ratingData}) {
    try {
      return await InovationModel.findByIdAndUpdate(
        inovation_id,
        {$push: {rating: ratingData}},
        {new: true},
      ).select('rating');
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async getRatingByInovation(id) {
    try {
      return await InovationModel.findById(id).select('rating').lean();
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async deleteRatingbyRating_id(id) {
    try {
      return await InovationModel.updateOne(
        {'rating._id': id},
        {$pull: {rating: {_id: id}}},
      );
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async getRatingByUserId(userId) {
    try {
      return await InovationModel.find({'rating.user_id': userId})
        .select('rating')
        .lean();
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async deleteInovation(id) {
    return await InovationModel.findByIdAndDelete(id);
  }
}
