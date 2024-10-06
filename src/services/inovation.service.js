// inovationService.js
import InovationModel from '../models/inovation.model.js';
import ResponseError from '../responses/error.response.js';
import {MongooseAggregationBuilder} from '../utils/buildQuery.js';

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
        .populate('category', '_id name')
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
      const builder = new MongooseAggregationBuilder(InovationModel);

      builder.addSearchQuery({user_id});

      if (q) {
        builder.addSearchQuery({
          $or: [
            {title: {$regex: q, $options: 'i'}},
            {description: {$regex: q, $options: 'i'}},
          ],
        });
      }

      if (status) builder.addSearchQuery({status});
      if (category) builder.addSearchQuery({'category.name': category});

      builder
        .addLookupStage({
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        })
        .addFields({
          category: {$arrayElemAt: ['$category', 0]},
        })
        .select('thumbnail title status category createdAt rating')
        .sort({[sort]: order === 'desc' ? -1 : 1})
        .paginate(page, perPage);

      const {results: inovations, count} = await builder.execute();
      const processedInovations = inovations.map((inov) => ({
        ...inov,
        average_rating: inov.rating
          ? inov.rating.reduce((acc, r) => acc + r.rating, 0) /
            inov.rating.length
          : 0,
        count_rating: inov.rating ? inov.rating.length : 0,
        rating: undefined,
      }));

      return {inovations: processedInovations, count};
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async searchAdminInovation({
    page = 1,
    perPage = 10,
    q,
    sort = 'createdAt',
    order = 'desc',
    category,
    status,
  }) {
    try {
      const builder = new MongooseAggregationBuilder(InovationModel);

      if (q) {
        builder.addSearchQuery({
          $or: [
            {title: {$regex: q, $options: 'i'}},
            {description: {$regex: q, $options: 'i'}},
          ],
        });
      }

      if (status) builder.addSearchQuery({status});
      if (category) builder.addSearchQuery({'category.name': category});

      builder
        .addLookupStage({
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        })
        .addFields({
          category: {$arrayElemAt: ['$category', 0]},
        })
        .select('thumbnail title status category createdAt rating')
        .sort({[sort]: order === 'desc' ? -1 : 1})
        .paginate(page, perPage);

      const {results: inovations, count} = await builder.execute();

      const processedInovations = inovations.map((inov) => ({
        ...inov,
        average_rating: inov.rating
          ? inov.rating.reduce((acc, r) => acc + r.rating, 0) /
            inov.rating.length
          : 0,
        count_rating: inov.rating ? inov.rating.length : 0,
        rating: undefined,
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
      const builder = new MongooseAggregationBuilder(InovationModel);

      if (q) {
        builder.addSearchQuery({
          $or: [
            {title: {$regex: q, $options: 'i'}},
            {description: {$regex: q, $options: 'i'}},
          ],
        });
      }

      if (category) builder.addSearchQuery({'category.name': category});

      builder
        .addLookupStage({
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        })
        .addFields({
          category: {$arrayElemAt: ['$category', 0]},
        })
        .select('thumbnail title status category createdAt rating')
        .sort({[sort]: order === 'desc' ? -1 : 1})
        .paginate(page, perPage);

      const {results: inovations, count} = await builder.execute();

      const processedInovations = inovations.map((inov) => ({
        ...inov,
        average_rating: inov.rating
          ? inov.rating.reduce((acc, r) => acc + r.rating, 0) /
            inov.rating.length
          : 0,
        count_rating: inov.rating ? inov.rating.length : 0,
        rating: undefined,
      }));

      return {inovations: processedInovations, count};
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async createRatingInovation({inovation_id, ...ratingData}) {
    try {
      // check if already rated by user
      const existingRating = await InovationModel.findOne({
        _id: inovation_id,
        'rating.user_id': ratingData.user_id,
      });
      if (existingRating) {
        throw new ResponseError('Already rated', 400);
      }

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
