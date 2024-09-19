import InovationModel from '../models/inovation.model.js';
import ResponseError from '../responses/error.response.js';

export default class InovationService {
  createInovation = async (data) => {
    try {
      return InovationModel.create({
        data,
      });
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

  async searchInovation({page, perPage, q, sort, order}) {
    try {
      let query = {};
      if (q) {
        query = {
          $or: [
            {title: {$regex: q, $options: 'i'}},
            {description: {$regex: q, $options: 'i'}},
            {category: {$regex: q, $options: 'i'}},
          ],
        };
      }

      const inovations = await InovationModel.find(query)
        .select('-updatedAt -__v')
        .skip((page - 1) * perPage)
        .limit(perPage)
        .sort({[sort]: order});

      const count = await InovationModel.countDocuments(query);

      return {inovations, count};
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }
}
