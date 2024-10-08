import CategoriesService from '../services/categories.service.js';
import ResponseError from '../responses/error.response.js';
import ResponseApi from '../responses/api.response.js';
import * as validator from '../validate/categories.validate.js';

export default class CategoriesController {
  constructor() {
    this.service = new CategoriesService();
  }

  createCategory = async (req, res, next) => {
    try {
      const {value, error} = validator.categorySchema.validate(req.body);
      if (error) {
        throw new ResponseError(error.message, 400);
      }
      const category = await this.service.createCategory(value);
      return ResponseApi.created(res, category);
    } catch (error) {
      next(error);
    }
  };

  getAllCategories = async (req, res, next) => {
    try {
      const categories = await this.service.getAllCategories();
      return ResponseApi.success(res, categories);
    } catch (error) {
      return next(error);
    }
  };

  getCategoryById = async (req, res, next) => {
    try {
      if (!req.params.id) {
        throw new ResponseError('Category not found', 404);
      }
      const category = await this.service.getCategoryById(req.params.id);
      if (!category) {
        throw new ResponseError('Category not found', 404);
      }
      return ResponseApi.success(res, category);
    } catch (error) {
      return next(error);
    }
  };

  updateCategory = async (req, res, next) => {
    try {
      const {value, error} = validator.categoryUpdateSchema.validate(req.body);
      if (error) {
        throw new ResponseError(error.message, 400);
      }

      const category = await this.service.updateCategory(req.params.id, value);
      return ResponseApi.success(res, category);
    } catch (error) {
      return next(error);
    }
  };

  deleteCategory = async (req, res, next) => {
    try {
      if (!req.params.id) {
        throw new ResponseError('Category not found', 404);
      }
      const category = await this.service.deleteCategory(req.params.id);
      return ResponseApi.noContent(res, category);
    } catch (error) {
      return next(error);
    }
  };

  searchCategories = async (req, res, next) => {
    try {
      const {value, error} = validator.categoryQuerySchema.validate(req.query);
      if (error) {
        throw new ResponseError(error.message, 400);
      }
      const {categories, count} = await this.service.searchCategories(value);

      const pagination = {
        total: count,
        perPage: value.perPage,
        page: value.page,
      };
      return ResponseApi.success(res, categories, pagination);
    } catch (error) {
      return next(error);
    }
  };
}
