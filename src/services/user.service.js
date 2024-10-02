import UserModel from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import ResponseError from '../responses/error.response.js';

import {buildAggregationPipeline} from '../utils/buildQuery.js';

export default class UserService {
  async createUser(user) {
    try {
      // create user in db and select only email and name fields
      const newUser = await UserModel.create({
        ...user,
      });
      // return only email and name fields
      return {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        fullname: newUser.fullname,
      };
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async isAdminById(id) {
    const user = await UserModel.findById(id).select('role');
    return user.role === 'admin';
  }

  async getUserRoleById(id) {
    return await UserModel.findById(id).select('role');
  }

  //   findById(id) {
  async findById(id) {
    return await UserModel.findById(id).select(
      '-password -resetPassword -emailVerify',
    );
  }
  async findByIdPassword(id) {
    return await UserModel.findById(id).select('+password');
  }
  async findByEmailLogin(email) {
    return await UserModel.find({email}).select('+password');
  }

  // deleteRefreshTokenByUserId(userId) {
  async deleteRefreshTokenByUserId(userId) {
    return await RefreshToken.deleteMany({user: userId});
  }

  // update user
  async updateUser(userId, user) {
    return await UserModel.findByIdAndUpdate(userId, {$set: user}, {new: true});
  }

  // search users
  async searchUsers({page, perPage, q, sort, order, role}) {
    const options = {
      page,
      perPage,
      sort: {[sort]: order === 'desc' ? -1 : 1},
      select: {
        fullname: 1,
        username: 1,
        email: 1,
        role: 1,
        createdAt: 1,
        _id: 1,
        provider: 1,
        'inovator.fakultas': 1,
        'inovator.prodi': 1,
      },
    };

    if (q) {
      options.search = {
        $or: [{fullname: q}, {username: q}, {email: q}],
      };
    }

    if (role) {
      options.search = {...options.search, role};
    }

    const builder = buildAggregationPipeline(UserModel, options);
    const {results, count} = await builder.execute();

    return {users: results, count};
  }

  // count search users
  async countSearchUsers(query) {
    return await UserModel.countDocuments({
      $or: [
        {fullname: {$regex: new RegExp(query, 'i')}},
        {username: {$regex: new RegExp(query, 'i')}},
        {email: {$regex: new RegExp(query, 'i')}},
      ],
    });
  }

  // delete user
  async deleteUser(userId) {
    return await UserModel.findByIdAndDelete(userId);
  }
}
