import Categories from '../models/categories.model.js';
import ResponseError from '../responses/error.response.js';

export default class CategoriesService {
  async createCategory(category) {
    try {
      return await Categories.create(category);
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async getAllCategories() {
    return await Categories.find();
  }

  async getCategoryById(id) {
    return await Categories.findById(id);
  }

  async updateCategory(id, category) {
    return await Categories.findByIdAndUpdate(
      id,
      {$set: category},
      {new: true},
    );
  }

  async deleteCategory(id) {
    return await Categories.findByIdAndDelete(id);
  }
}
