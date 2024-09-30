import InovationModel from '../models/inovation.model.js';
import ResponseError from '../responses/error.response.js';
import {MongooseAggregationBuilder} from '../utils/buildQuery.js';
export default class InovationService {
  createInovation = async (data) => {
    try {
      return InovationModel.create(data);
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  };

  findById = async (id) => {
    return InovationModel.findById(id);
  };

  updateInovation = async (id, data) => {
    try {
      return InovationModel.findByIdAndUpdate(id, {$set: data}, {new: true});
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
      const queryBuilder = new MongooseAggregationBuilder(InovationModel);

      if (q) {
        queryBuilder.addSearchQuery({
          $or: [
            {field: 'title', value: q},
            {field: 'description', value: q},
          ],
        });
      }

      if (status) {
        queryBuilder.addSearchQuery({status: status});
      }

      if (category) {
        queryBuilder.addSearchQuery({'category.name': category});
      }

      queryBuilder.sort(sort, order).paginate(page, perPage);

      const {results, count} = await queryBuilder.execute();

      return {inovations: results, count};
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async searchInovation({page, perPage, q, sort, order, ...params}) {
    // { 'category.name': 'Practical Frozen Computer,Gorgeous Steel Bike' } params

    // build query to search inovation by title and description with category name and sort by average rating

    // // make aggregation to get average rating and count rating for each inovation
    // const inovations = await InovationModel.aggregate([
    //   {
    //     $match: query,
    //   },
    //   {
    //     $lookup: {
    //       from: 'ratings',
    //       localField: '_id',
    //       foreignField: 'inovation_id',
    //       as: 'rating',
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'categories',
    //       localField: 'category',
    //       foreignField: '_id',
    //       as: 'category',
    //     },
    //   },
    //   {
    //     $addFields: {
    //       average_rating: {
    //         $avg: '$rating.rating',
    //       },
    //       count_rating: {
    //         $size: '$rating',
    //       },
    //     },
    //   },
    //   {
    //     // only show fields that we need to show
    //     // like _id,image,title,category,name,average_rating,count_rating
    //     $project: {
    //       _id: 1,
    //       Image: 1,
    //       title: 1,
    //       category: {name: 1},
    //       average_rating: 1,
    //       count_rating: 1,
    //     },
    //   },
    //   {
    //     $sort: {[sort]: order === 'desc' ? -1 : 1},
    //   },
    //   {
    //     $skip: (page - 1) * perPage,
    //   },
    //   {
    //     $limit: perPage,
    //   },
    // ]);

    // const count = await InovationModel.countDocuments(query);

    // return {inovations, count};

    try {
      const queryBuilder = new MongooseAggregationBuilder(InovationModel);

      if (q) {
        queryBuilder.addSearchQuery({
          $and: [
            {field: 'status', value: 'approved'},
            {
              $or: [
                {field: 'title', value: q},
                {field: 'description', value: q},
              ],
            },
          ],
        });
      }

      if (params.category) {
        queryBuilder.addSearchQuery({'category.name': params.category});
      }

      queryBuilder.sort(sort, order).paginate(page, perPage);

      // make aggregation to get average rating and count rating for each inovation
      queryBuilder.addLookupStage('ratings');
      queryBuilder.addLookupStage('categories');
      queryBuilder.addFields({
        average_rating: {
          $avg: '$rating.rating',
        },
        count_rating: {
          $size: '$rating',
        },
      });
      queryBuilder.selectFields({
        _id: 1,
        Image: 1,
        title: 1,
        'category.name': 1,
        average_rating: 1,
        count_rating: 1,
      });

      const {results, count} = await queryBuilder.execute();

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
      return InovationModel.findById(id).select('rating');
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
      return InovationModel.find({rating: {$elemMatch: {user_id: id}}}).select(
        'rating',
      );
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }
}
