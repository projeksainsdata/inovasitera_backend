import DiscussionService from '../services/discussion.service.js';
import ResponseError from '../responses/error.response.js';
import ResponseApi from '../responses/api.response.js';
import * as discussionValidate from '../validate/discussion.validate.js';

export default class DiscussionController {
  constructor() {
    this.service = new DiscussionService();
  }

  createDiscussion = async (req, res, next) => {
    try {
      const {value, error} = discussionValidate.discussionSchema.validate(
        req.body,
      );
      if (error) {
        throw new ResponseError(error.message, 400);
      }

      const discussion = await this.service.createDiscussion({
        ...value,
        user_id: req.user._id,
      });

      return ResponseApi.success(res, discussion);
    } catch (error) {
      next(error);
    }
  };

  getDiscussionById = async (req, res, next) => {
    try {
      const {value, error} = discussionValidate.discussionIdSchema.validate(
        req.params,
      );
      if (error) {
        throw new ResponseError(error.message, 400);
      }

      const discussion = await this.service.getDiscussionById(value.id);

      return ResponseApi.success(res, discussion);
    } catch (error) {
      next(error);
    }
  };

  getDiscussionByUserId = async (req, res, next) => {
    try {
      if (!req.user._id) {
        throw new ResponseError('User not found', 404);
      }
      const discussions = await this.service.getDiscussionByUserId(
        req.user._id,
      );

      return ResponseApi.success(res, discussions);
    } catch (error) {
      next(error);
    }
  };

  getDiscussionByInovation = async (req, res, next) => {
    try {
      const {value, error} = discussionValidate.discussionIdSchema.validate(
        req.params,
      );
      if (error) {
        throw new ResponseError(error.message, 400);
      }
      const discussions = await this.service.getDiscussionByInovation(value.id);

      return ResponseApi.success(res, discussions);
    } catch (error) {
      next(error);
    }
  };

  updateDiscussion = async (req, res, next) => {
    try {
      if (!req.params.id) {
        throw new ResponseError('id is required', 400);
      }
      const {value, error} = discussionValidate.discussionUpdateSchema.validate(
        req.body,
      );
      if (error) {
        throw new ResponseError(error.message, 400);
      }

      const discussion = await this.service.updateDiscussion(
        req.params.id,
        value,
      );
      return ResponseApi.success(res, discussion);
    } catch (error) {
      next(error);
    }
  };

  deleteDiscussion = async (req, res, next) => {
    try {
      if (!req.params.id) {
        throw new ResponseError('id is required', 400);
      }
      const discussion = await this.service.deleteDiscussion(req.params.id);
      return ResponseApi.success(res, discussion);
    } catch (error) {
      next(error);
    }
  };

  getReplies = async (req, res, next) => {
    try {
      const replies = await this.service.getReplies(req.params.id);
      return ResponseApi.success(res, replies);
    } catch (error) {
      next(error);
    }
  };
}
