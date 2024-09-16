import UserModel from '../models/user.model.js'
import RefreshToken from '../models/refreshToken.model.js'
import ResponseError from '../responses/error.response.js'

export default class UserService {
  async createUser(user) {
    try {
      // create user in db and select only email and name fields
      const newUser = await UserModel.create({
        ...user
      })
      // return only email and name fields
      return {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username
      }
    } catch (error) {
      throw new ResponseError(error.message, 400)
    }
  }

  async isAdminById(id) {
      const user = await UserModel.findById(id).select('role')
      return user.role === 'admin'
  }

  async getUserRoleById(id) {
      return await UserModel.findById(id).select('role')
  }

  async findByUsername(username) {
      return await UserModel.find({ username })
  }
  //   findById(id) {
  async findById(id) {
      return await UserModel.findById(id)
  }
  async findByIdPassword(id) {
      return await UserModel.findById(id).select('+password')
  }
  async findByEmailLogin(email) {
      return await UserModel.find({ email }).select('+password')
  }

  // deleteRefreshTokenByUserId(userId) {
  async deleteRefreshTokenByUserId(userId) {
      return await RefreshToken.deleteMany({ user: userId })
  }

  // update verification status
  async updateVerificationStatus(userId, status) {
      return await UserModel.findByIdAndUpdate(
        userId,
        { isVerified: status },
        { new: true }
      )
  }

  async updatePassword(userId, password) {
      return await UserModel.findByIdAndUpdate(
        userId,
        { password },
        { new: true }
      )
  }

  // search users
  async searchUsers({ page, perPage, q }) {
      if (!q) {
        return await UserModel.find()
          .select('-password -createdAt -updatedAt -__v')
          .skip((page - 1) * perPage)
          .limit(perPage)
      }
      return await UserModel.find({
        $or: [
          { fullname: { $regex: new RegExp(q, 'i') } },
          { username: { $regex: new RegExp(q, 'i') } },
          { email: { $regex: new RegExp(q, 'i') } },
          { 'personal_info.bio': { $regex: new RegExp(q, 'i') } }
        ]
      })
        .select('-password -createdAt -updatedAt -__v')

        .skip((page - 1) * perPage)
        .limit(perPage)
  }

  // update user
  async updateUser(userId, user) {
      return await UserModel.findByIdAndUpdate(
        userId,
        { $set: user },
        { new: true }
      )
  }

  // count search users
  async countSearchUsers(query) {
      return await UserModel.countDocuments({
        $or: [
          { fullname: { $regex: new RegExp(query, 'i') } },
          { username: { $regex: new RegExp(query, 'i') } },
          { email: { $regex: new RegExp(query, 'i') } },
          { 'personal_info.bio': { $regex: new RegExp(query, 'i') } }
        ]
      })
  }

  // delete user
  async deleteUser(userId) {
      return await UserModel.findByIdAndDelete(userId)
  }

  async updateUserByUsername(username, updateFields) {
      const user = await UserModel.findOneAndUpdate(
        { username },
        { $set: updateFields },
        { new: true }
      )

      if (!user) {
        throw new ResponseError('User not found', 404)
      }

      return {
        user: {
          username: user.username,
          email: user.email,
          fullname: user.fullname
          // Add other fields as needed
        },
        message: 'User updated successfully'
      }
  }

  async readUserById(id) {
      const user = await UserModel.findById(id)
      if (!user) {
        throw new ResponseError('User not found', 404)
      }
      return user
  }
}
