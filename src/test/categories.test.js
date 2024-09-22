import request from 'supertest';
import express from 'express';
import CategoriesController from '../controllers/categories.controller.js';
import CategoriesService from '../services/categories.service.js';
import ResponseApi from '../responses/api.response.js';
import * as validator from '../validate/categories.validate.js';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('../services/categories.service.js');
jest.mock('../responses/api.response.js');
jest.mock('../responses/error.response.js');
jest.mock('../validate/categories.validate.js');

const app = express();
app.use(express.json());

const controller = new CategoriesController();
app.post('/categories', controller.createCategory);
app.get('/categories', controller.getAllCategories);
app.get('/categories/:id', controller.getCategoryById);
app.put('/categories/:id', controller.updateCategory);
app.delete('/categories/:id', controller.deleteCategory);

describe('CategoriesController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const category = { name: 'Test Category' };
      validator.categorySchema.validate.mockReturnValue({ value: category, error: null });
      CategoriesService.prototype.createCategory.mockResolvedValue(category);
      ResponseApi.created.mockImplementation((res, data) => res.status(201).json(data));

      const res = await request(app).post('/categories').send(category);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(category);
    });

  
  });

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      const categories = [{ name: 'Category 1' }, { name: 'Category 2' }];
      CategoriesService.prototype.getAllCategories.mockResolvedValue(categories);
      ResponseApi.mockImplementation((res, data) => res.status(200).json(data));

      const res = await request(app).get('/categories');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(categories);
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const category = { name: 'Updated Category' };
      validator.categoryUpdateSchema.validate.mockReturnValue({ value: category, error: null });
      CategoriesService.prototype.updateCategory.mockResolvedValue(category);
      ResponseApi.mockImplementation((res, data) => res.status(200).json(data));

      const res = await request(app).put('/categories/1').send(category);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(category);
    });


  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      const category = { name: 'Deleted Category' };
      CategoriesService.prototype.deleteCategory.mockResolvedValue(category);
      ResponseApi.mockImplementation((res, data) => res.status(200).json(data));

      const res = await request(app).delete('/categories/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(category);
    });

    
  });
});