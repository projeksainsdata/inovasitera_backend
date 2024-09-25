import InovationService from '../services/inovation.service.js';
import ResponseError from '../responses/error.response.js';
import ResponseApi from '../responses/api.response.js';
import * as validator from '../validate/inovation.validate.js';

export default class InovationController {
  services = new InovationService();

  createInovation = async (req, res, next) => {
    try {
      const user_id = req.user._id;
      const {value, error} = validator.inovationSchema.validate({
        ...req.body,
        user_id,
      });
      if (error) {
        throw new ResponseError(error.message, 400);
      }

      console.log(value);

      const inovation = await this.services.createInovation(value);
      return ResponseApi.success(res, inovation);
    } catch (error) {
      next(error);
    }
  };

  getInovation = async (req, res, next) => {
    try {
      const {value, error} = validator.inovationIdSchema.validate(req.params);
      if (error) {
        throw new ResponseError(error.message, 400);
      }

      const inovation = await this.services.findById(value.id);
      return ResponseApi.success(res, inovation);
    } catch (error) {
      next(error);
    }
  };

  updateInovation = async (req, res, next) => {
    try {
      const {value, error} = validator.inovationUpdateSchema.validate(req.body);
      if (error) {
        throw new ResponseError(error.message, 400);
      }

      const inovation = await this.services.updateInovation(
        req.params.id,
        value,
      );
      return ResponseApi.success(res, inovation);
    } catch (error) {
      next(error);
    }
  };

  deleteInovation = async (req, res, next) => {
    try {
      const {value, error} = validator.inovationIdSchema.validate(req.params);
      if (error) {
        throw new ResponseError(error.message, 400);
      }

      await this.services.deleteInovation(value.id);
      return ResponseApi.success(res, 'Inovation deleted');
    } catch (error) {
      next(error);
    }
  };

  searchInovation = async (req, res, next) => {
    try {
      const {value, error} = validator.inovationQuerySchema.validate(req.query);
      if (error) {
        throw new ResponseError(error.message, 400);
      }

      const {inovations, count} = await this.services.searchInovation(value);
      const pagination = {
        page: req.query.page,
        perPage: req.query.perPage,
        total: count,
      };
      return ResponseApi.success(res, inovations, pagination);
    } catch (error) {
      next(error);
    }
  };
}
