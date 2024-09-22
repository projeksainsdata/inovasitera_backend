// test-utils.js
import mongoose from 'mongoose';
import {jest} from '@jest/globals';

const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'testuser',
  email: 'testuser@example.com',
  password: 'hashedpassword',
};

const mockUserModel = {
  findOne: jest.fn().mockResolvedValue(mockUser),
  create: jest.fn().mockResolvedValue(mockUser),
  // Mocking the instance method save
  save: jest.fn().mockImplementation(function () {
    return Promise.resolve(this);
  }),
};

export {mockUser, mockUserModel};
