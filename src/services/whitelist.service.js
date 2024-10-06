import WhitelistModel from '../models/whitelist.model.js';
import ResponseError from '../responses/error.response.js';

export default class WhitelistService {
  async createWhitelist(whitelist) {
    try {
      // check if whitelist already exists
      const existingWhitelist = await WhitelistModel.findOne({
        user_id: whitelist.user_id,
        inovation_id: whitelist.inovation_id,
      });
      if (existingWhitelist) {
        throw new ResponseError('Whitelist already exists', 400);
      }

      return await WhitelistModel.create(whitelist);
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async getWhitelistByUserId(id) {
    const inovator = await WhitelistModel.find({user_id: id}).populate(
      'inovation_id',
      '_id thumbnail title status category createdAt  rating',
    );
    const new_inovator = inovator.map((inv) => {
      return {
        _id: inv.inovation_id?._id,
        thumbnail: inv.inovation_id?.thumbnail,
        title: inv.inovation_id?.title,
        status: inv.inovation_id?.status,
        createdAt: inv.inovation_id?.createdAt,
        rating: inv.inovation_id?.rating
          ? inv.inovation_id?.rating.reduce((acc, r) => acc + r.rating, 0) /
            inv.inovation_id?.rating.length
          : 0,
      };
    });

    return new_inovator;
  }
  async findByInovationId(id) {
    return await WhitelistModel.findOne({
      inovation_id: id,
    });
  }
  async deleteWhitelist(id) {
    return await WhitelistModel.findOneAndDelete({inovation_id: id});
  }

  async updateWhitelist(id, whitelist) {
    return await WhitelistModel.findByIdAndUpdate(
      id,
      {
        $set: whitelist,
      },
      {new: true},
    );
  }
}
