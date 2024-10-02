import InovationModel from '../models/inovation.model.js';
import ResponseError from '../responses/error.response.js';
import {buildAggregationPipeline} from '../utils/buildQuery.js';

export default class InovationService {
  createInovation = async (data) => {
    try {
      return InovationModel.create(data);
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  };

  findById = async (id) => {
    try {
      return InovationModel.findById(id);
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  };

  updateInovation = async (id, data) => {
    try {
      return InovationModel.findByIdAndUpdate(id, {$set: data}, {new: true});
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  };

  searchUserInovation = async (
    user_id,
    {page, perPage, q, sort, order, category, status},
  ) => {
    try {
      const options = {
        search: {user_id},
        page,
        perPage,
        sort: {[sort]: order === 'desc' ? -1 : 1},
        lookup: [
          {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category',
          },
        ],
        addFields: {
          average_rating: {$avg: '$rating.rating'},
          count_rating: {$size: '$rating'},
          category: {$arrayElemAt: ['$category', 0]},
        },
        select: {
          _id: 1,
          Image: 1,
          title: 1,
          average_rating: 1,
          status: 1,
          category: 1,
          createdAt: 1,
        },
      };

      if (q) {
        options.search.$or = [{title: q}, {description: q}];
      }

      if (status) {
        options.search.status = status;
      }

      if (category) {
        options.search['category.name'] = category;
      }

      const builder = buildAggregationPipeline(InovationModel, options);
      const {results, count} = await builder.execute();

      return {inovations: results, count};
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  };

  deleteInovation = async (id) => {
    return InovationModel.findByIdAndDelete(id);
  };

  async searchAdminInovation({
    page,
    perPage,
    q,
    sort,
    order,
    category,
    status,
  }) {
    try {
      const options = {
        page,
        perPage,
        sort: {[sort]: order === 'desc' ? -1 : 1},
        populate: ['category'],
        select: {
          _id: 1,
          thumbnail: 1,
          title: 1,
          status: 1,
          createdAt: 1,
          category: 1,
        },
      };

      if (q) {
        options.search = {
          $or: [{title: q}, {description: q}],
        };
      }

      if (status) {
        options.search = {...options.search, status};
      }

      if (category) {
        options.search = {...options.search, 'category.name': category};
      }

      const builder = buildAggregationPipeline(InovationModel, options);
      const {results, count} = await builder.execute();

      return {inovations: results, count};
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async searchInovation({page, perPage, q, sort, order, ...params}) {
    try {
      const options = {
        page,
        perPage,
        sort: {[sort]: order === 'desc' ? -1 : 1},
        search: {status: 'approved'},
        addFields: {
          average_rating: {$avg: '$rating.rating'},
          count_rating: {$size: '$rating'},
        },
        select: {
          _id: 1,
          thumbnail: 1,
          title: 1,
          'category.name': 1,
          average_rating: 1,
          count_rating: 1,
        },
        populate: ['category', 'rating'],
        lookup: [
          {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category',
          },
        ],
      };

      if (q) {
        options.search.$or = [{title: q}, {description: q}];
      }

      if (params.category) {
        options.search['category.name'] = params.category;
      }

      const builder = buildAggregationPipeline(InovationModel, options);
      const {results, count} = await builder.execute();

      return {inovations: results, count};
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async createRatingInovation(id, data) {
    try {
      return InovationModel.findByIdAndUpdate(id, {
        $push: {rating: data},
      }).select('rating');
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async getRatingByInovation(id) {
    try {
      const builder = buildAggregationPipeline(InovationModel, {
        search: {_id: id},
        select: {rating: 1},
      });
      const {results} = await builder.execute();
      return results[0];
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async deleteRatingbyRating_id(id) {
    try {
      return InovationModel.updateOne(
        {rating: {$elemMatch: {_id: id}}},
        {$pull: {rating: {_id: id}}},
      );
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async getRatingByUserId(id) {
    try {
      const builder = buildAggregationPipeline(InovationModel, {
        search: {'rating.user_id': id},
        select: {rating: 1},
      });
      return builder.execute();
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }
}
