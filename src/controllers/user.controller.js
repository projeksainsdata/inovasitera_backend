import UserServices from '../services/user.service.js';
import ResponseApi from '../responses/api.response.js';
import ResponseError from '../responses/error.response.js';
import * as userValidate from '../validate/user.validate.js';
import AuthService from '../services/auth.service.js';

class UserControllers {
  constructor() {
    this.service = new UserServices();
    this.authService = new AuthService();
  }

  // update user by user
  updateUser = async (req, res, next) => {
    try {
      // validate the request body
      const {value, error} = userValidate.userUpdateSchema.validate(req.body);
      if (error) {
        throw new ResponseError(error.message, 400);
      }
      const user_params = await this.service.findByIdPassword(req.params.id);

      // check if the user is updating the password
      if (
        value.currentPassword ||
        value.newPassword ||
        value.confirmNewPassword
      ) {
        // validate the password fields

        const validatorPassword =
          userValidate.userUpdatePasswordSchema.validate({
            newPassword: value.newPassword,
            confirmNewPassword: value.confirmNewPassword,
          });

        if (validatorPassword.error) {
          throw new ResponseError(validatorPassword.error.message, 400);
        }

        // check if the old password is correct
        const isMatch = await this.authService.comparePassword(
          value.currentPassword,
          user_params.password,
        );

        if (!isMatch) {
          throw new ResponseError('Old password is incorrect', 400);
        }

        // encrypt the password
        value.password = await this.authService.hashPassword(value.newPassword);
      }

      // call the service
      await this.service.updateUser(user_params._id, value);
      // call new updated user
      const userNew = await this.service.findById(user_params._id);
      // make new token
      const tokens = await this.authService.createAccessAndRefreshToken({
        user: {
          _id: userNew._id,
          email: userNew.email,
          username: userNew.username,
          role: userNew.role,
          emailVerified: userNew.emailVerified,
          profile: userNew.profile,
          status: userNew?.inovator?.status,
        },
      });

      return ResponseApi.success(res, {user: userNew, tokens});
    } catch (error) {
      return next(error);
    }
  };

  // delete user by admin
  deleteUser = async (req, res, next) => {
    try {
      // call the service
      await this.service.deleteUser(req.params.id);
      // send the response
      return ResponseApi.success(res, 'User deleted successfully');
    } catch (error) {
      return next(error);
    }
  };

  searchUser = async (req, res, next) => {
    try {
      // check pagination req.query.page and req.query.perPage are present or not set default value
      const {value, error} = userValidate.userQuerySchema.validate(req.query);
      if (error) {
        throw new ResponseError(error.message, 400);
      }
      const {users, count} = await this.service.searchUsers(value);
      const pagination = {
        page: req.query.page,
        perPage: req.query.perPage,
        total: count,
      };
      // call the service
      // send the response
      return ResponseApi.success(res, users, pagination);
    } catch (error) {
      return next(error);
    }
  };

  // get user by id
  getUserById = async (req, res, next) => {
    try {
      // call the service
      const user = await this.service.findById(req.params.id);
      // send the response
      return ResponseApi.success(res, user);
    } catch (error) {
      return next(error);
    }
  };

  generateUsername = async (email) => {
    // LIKE DISCORD LOGIC TO GENERATE USERNAME
    // USERNAME#XXXX
    // USERNAME#0001
    // USERNAME#0002

    // get username from email
    const username = email.split('@')[0];

    const random = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(5, '0');

    return `${username}#${random}`;
  };
}

export default UserControllers;
