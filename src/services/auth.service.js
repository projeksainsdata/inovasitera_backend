import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import RefreshToken from '../models/refreshToken.model.js';
import config from '../config/config.js';
import ResponseError from '../responses/error.response.js';
import UserModel from '../models/user.model.js';
import axios from 'axios';
import generateUsername from '../helpers/generateUsername.js';
export default class AuthService {
  // generate token
  generateToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiration,
    });
  }

  isIteraEmail(email) {
    try {
      // check if email is from itera from XXX@student.itera.ac.id or include itera.ac.id
      // use regex to check email format
      // check if email format is valid
      const email_validation =
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!email_validation.test(email)) {
        return false;
      }
      // check if email is not from itera throw error
      if (!email.includes('itera.ac.id')) {
        return false;
      }
      // check if email is from itera return true
      return true;
    } catch {
      throw false;
    }
  }

  // generate refresh token
  async generateRefreshToken(user_id) {
    let refreshToken = await RefreshToken.createToken(user_id);
    return refreshToken;
  }

  // verify token
  verify(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw ResponseError.unauthorized('Token expired');
      }
      throw ResponseError.unauthorized('Invalid token');
    }
  }

  static verify(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw ResponseError.unauthorized('Token expired');
      }
      throw ResponseError.unauthorized('Invalid token');
    }
  }

  // create access and refresh token
  async createAccessAndRefreshToken(payload) {
    return {
      access: this.generateToken(payload),
      refresh: await this.generateRefreshToken(payload.user),
    };
  }

  // find refresh token
  async findRefreshToken(token) {
    return RefreshToken.findOne({token})
      .populate('user')
      .select('-user.password');
  }

  // verify or delete refresh token
  async verifyOrDeleteRefreshToken(refreshToken) {
    if (RefreshToken.verifyExpiration(refreshToken)) {
      await RefreshToken.deleteOne({token: refreshToken.token});
      throw new ResponseError('Refresh token expired', 400);
    } else {
      return refreshToken;
    }
  }

  // compare password
  async comparePassword(password, userPassword) {
    return bcrypt.compare(password, userPassword);
  }

  // hash password
  async hashPassword(password) {
    return bcrypt.hash(password, config.bcrypt.saltRounds);
  }

  // delete refresh token
  async deleteRefreshToken(token) {
    return RefreshToken.deleteOne({token});
  }

  // delete refresh token by user id
  async deleteRefreshTokenByUserId(userId) {
    return RefreshToken.deleteMany({user: userId});
  }

  // create email verify token
  async createEmailVerifyToken(user_id) {
    // get user by id
    const user = await UserModel.findById(user_id);

    if (!user) {
      throw new ResponseError('User not found', 404);
    }

    // delete all email verify token by user id
    await this.deleteEmailVerifyTokenByUserId(user_id);

    // create email verify token and exp 5 minute and update field emailVerify in user
    const token_email = jwt.sign({user_id}, config.jwt.secret, {
      expiresIn: '5m',
    });

    user.emailVerify = token_email;
    await user.save();

    return token_email;
  }

  // get email verify token
  async getEmailVerifyToken(token) {
    return UserModel.findOne({emailVerify: token});
  }
  // get and verify email verify token
  async getAndVerifyEmailVerifyToken(token) {
    const user = await this.getEmailVerifyToken(token);
    if (!user) {
      throw new ResponseError('Email verify token not found', 404);
    }
    // check if token is valid
    if (this.verify(token)) {
      throw new ResponseError('Email verify token is invalid', 400);
    }
    return user;
  }

  // delete email verify token
  async deleteEmailVerifyToken(token) {
    return UserModel.findOneAndUpdate({emailVerify: token}, {emailVerify: ''});
  }

  // verify email verify token
  async verifyEmailVerifyToken(emailVerifyToken) {
    return this.verify(emailVerifyToken);
  }

  async deleteEmailVerifyTokenByUserId(userId) {
    return UserModel.findOneAndUpdate({_id: userId}, {emailVerify: ''});
  }

  // get reset password token
  async getResetPasswordToken(token) {
    return UserModel.findOne({resetPassword: token});
  }

  // get and verify reset password token
  async getAndVerifyResetPasswordToken(token) {
    const user = await this.getResetPasswordToken(token);
    if (!user) {
      throw new ResponseError('Reset password token not found', 404);
    }
    // check if token is valid
    if (this.verify(token)) {
      throw new ResponseError('Reset password token is invalid', 400);
    }
    return user;
  }
  // create reset password token
  async createResetPasswordToken(user_id) {
    // get user by id
    const user = await UserModel.findById(user_id);

    if (!user) {
      throw new ResponseError('User not found', 404);
    }

    // delete all reset password token by user id
    await this.deleteResetPasswordTokenByUserId(user_id);

    // create reset password token and exp 5 minute and update field resetPassword in user
    const token_reset = jwt.sign({user_id}, config.jwt.secret, {
      expiresIn: '5m',
    });

    user.resetPassword = token_reset;
    await user.save();

    return token_reset;
  }

  // delete reset password token
  async deleteResetPasswordToken(token) {
    return UserModel.findOneAndUpdate(
      {resetPassword: token},
      {resetPassword: ''},
    );
  }
  async deleteResetPasswordTokenByUserId(userId) {
    return UserModel.findOneAndUpdate({_id: userId}, {resetPassword: ''});
  }
  // verify reset password token
  async verifyResetPasswordToken(resetPasswordToken) {
    return this.verify(resetPasswordToken);
  }

  async verifyGoogleAccount(profile) {
    // get user from google account email
    const user = await UserModel.findOne({email: profile.emails[0].value});
    if (!user) {
      const newUser = new UserModel.create({
        email: profile.emails[0].value,
        fullname: profile.displayName,
        provider: 'google',
        profile: profile.photos[0].value,
        username: generateUsername(profile.emails[0].value),
        emailVerified: true,
      });
      return newUser;
    }

    return user;
  }

  async getGoogleAccessToken(code) {
    const {google} = config;
    const {data} = await axios.post(
      `https://oauth2.googleapis.com/token?code=${code}&client_id=${google.clientId}&client_secret=${google.clientSecret}&redirect_uri=${google.redirectUri}&grant_type=authorization_code`,
    );
    return data;
  }

  async getGoogleUserInfo(accessToken) {
    const {data} = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`,
    );
    return data;
  }
}
