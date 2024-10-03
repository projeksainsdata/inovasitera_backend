import WhitelistModel from '../models/whitelist.model.js';
import ResponseError from '../responses/error.response.js';

export default class WhitelistService {
  async createWhitelist(whitelist) {
    try {
      // check if whitelist already exists
      const existingWhitelist = await WhitelistModel.findOne({
        user_id: whitelist.user_id,
        email: whitelist.email,
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
    return await WhitelistModel.find({user_id: id});
  }

  async deleteWhitelist(id) {
    return await WhitelistModel.findByIdAndDelete(id);
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
