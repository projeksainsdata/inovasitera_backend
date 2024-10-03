// userService.js
import UserModel from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import ResponseError from '../responses/error.response.js';

export default class UserService {
  async createUser(user) {
    try {
      const newUser = await UserModel.create(user);
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
    const user = await UserModel.findById(id).select('role').lean();
    return user?.role === 'admin';
  }

  async getUserRoleById(id) {
    return await UserModel.findById(id).select('role').lean();
  }

  async findById(id) {
    return await UserModel.findById(id)
      .select('-password -resetPassword -emailVerify')
      .lean();
  }

  async findByIdPassword(id) {
    return await UserModel.findById(id).select('+password').lean();
  }

  async findByEmailLogin(email) {
    return await UserModel.findOne({email}).select('+password').lean();
  }

  async deleteRefreshTokenByUserId(userId) {
    return await RefreshToken.deleteMany({user: userId});
  }

  async updateUser(userId, userData) {
    return await UserModel.findByIdAndUpdate(
      userId,
      {$set: userData},
      {new: true},
    ).lean();
  }

  async searchUsers({
    page = 1,
    perPage = 10,
    q,
    sort = 'createdAt',
    order = 'desc',
    role,
  }) {
    try {
      const query = {};

      // Build search conditions
      if (q) {
        query.$or = [
          {fullname: {$regex: q, $options: 'i'}},
          {username: {$regex: q, $options: 'i'}},
          {email: {$regex: q, $options: 'i'}},
        ];
      }

      if (role) {
        query.role = role;
      }

      // Build query
      const userQuery = UserModel.find(query)
        .select(
          'fullname username email role createdAt provider inovator.fakultas inovator.prodi',
        )
        .sort({[sort]: order === 'desc' ? -1 : 1})
        .skip((page - 1) * perPage)
        .limit(perPage);

      // Execute queries in parallel
      const [users, count] = await Promise.all([
        userQuery.lean(),
        UserModel.countDocuments(query),
      ]);

      return {users, count};
    } catch (error) {
      throw new ResponseError(error.message, 400);
    }
  }

  async deleteUser(userId) {
    return await UserModel.findByIdAndDelete(userId);
  }
}
