import request from 'supertest';
import express from 'express';
import UserControllers from '../controllers/user.controller.js';
import UserServices from '../services/user.service.js';
import ResponseApi from '../responses/api.response.js';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('../services/user.service.js');
jest.mock('../services/auth.service.js');
jest.mock('../responses/api.response.js');
jest.mock('../responses/error.response.js');
jest.mock('../validate/user.validate.js');

const app = express();
app.use(express.json());

const controller = new UserControllers();
app.put('/users/:id', controller.updateUser);
app.delete('/users/:id', controller.deleteUser);
app.get('/users/search', controller.searchUser);
app.get('/users/:id', controller.getUserById);

describe('UserControllers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });



  describe('deleteUser', () => {
    it('should delete a user', async () => {
      UserServices.prototype.deleteUser.mockResolvedValue();
      ResponseApi.success.mockImplementation((res, data) => res.status(200).json(data));

      const res = await request(app).delete('/users/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual('User deleted successfully');
    });
  });



  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const user = { name: 'User 1' };
      UserServices.prototype.findById.mockResolvedValue(user);
      ResponseApi.success.mockImplementation((res, data) => res.status(200).json(data));

      const res = await request(app).get('/users/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(user);
    });
  });
});