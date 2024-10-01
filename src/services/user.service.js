import UserModel from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import ResponseError from '../responses/error.response.js';

import {MongooseAggregationBuilder} from '../utils/buildQuery.js';

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
    const queryBuilder = new MongooseAggregationBuilder(UserModel);

    if (q) {
      queryBuilder.addSearchQuery({
        $or: [
          {field: 'fullname', value: q},
          {field: 'username', value: q},
          {field: 'email', value: q},
        ],
      });
    }

    if (role) {
      queryBuilder.addSearchQuery({role: role});
    }

    queryBuilder
      .sort(sort, order)
      .paginate(page, perPage)
      .selectFields({
        fullname: 1,
        username: 1,
        email: 1,
        role: 1,
        createdAt: 1,
        _id: 1,
        provider: 1,
        inovator: {
          fakultas: 1,
          prodi: 1,
        },
      });

    const {results, count} = await queryBuilder.execute();

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
