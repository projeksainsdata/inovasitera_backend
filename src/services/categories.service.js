import Category from '../models/categories.model.js';
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

  async searchCategories({page, perPage, q, sort, order}) {
    let query = {};
    if (q) {
      query = {
        $or: [
          {name: {$regex: new RegExp(q, 'i')}},
          {description: {$regex: new RegExp(q, 'i')}},
        ],
      };
    }
    const [categories, count] = await Promise.all([
      Category.find(query)
        .sort({[sort]: order})
        .skip((page - 1) * perPage)
        .limit(perPage),
      Category.countDocuments(query),
    ]);
    return {categories, count};
  }
}
