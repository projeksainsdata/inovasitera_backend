import Discussion from '../models/discussion.model.js';
import ResponseError from '../responses/error.response.js';

export default class DiscussionService {
  async createDiscussion(discussion) {
    try {
      return await Discussion.create(discussion);
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async getDiscussionById(id) {
    return await Discussion.findById(id);
  }

  async getDiscussionByUserId(id) {
    return await Discussion.find({user_id: id});
  }

  async getDiscussionByInovation(inovation_id) {
    return await Discussion.find({inovation_id}).populate(
      'parent_discussion_id',
    );
  }

  async updateDiscussion(id, discussion) {
    return await Discussion.findByIdAndUpdate(
      id,
      {$set: discussion},
      {new: true},
    );
  }

  async deleteDiscussion(id) {
    return await Discussion.findByIdAndDelete(id);
  }

  async getReplies(id) {
    return await Discussion.find({parent_discussion_id: id});
  }
}
