import AuthService from '../services/auth.service.js';
import UserService from '../services/user.service.js';
import ResponseError from '../responses/error.response.js';
import ResponseApi from '../responses/api.response.js';
import * as validate from '../validate/user.validate.js';
import nodemailer from 'nodemailer';
import config from '../config/config.js';
import emailVerifyTemplate from '../helpers/emailTemplate.js';

export default class AuthController {
  constructor() {
    this.services = new AuthService();
    this.userService = new UserService();
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  // register user
  register = async (req, res, next) => {
    try {
      const {value, error} = validate.userRegisterSchema.validate(req.body);
      if (error) {
        throw new ResponseError(error.message, 400);
      }
      // check if user already exists
      const user = await this.userService.findByEmailLogin(value.email);
      if (user) {
        throw new ResponseError('User already exists', 400);
      }

      // hash password
      value.password = await this.services.hashPassword(value.password);
      const newUser = await this.userService.createUser(value);
      return ResponseApi.created(res, newUser);
    } catch (error) {
      next(error);
    }
  };

  // login user
  login = async (req, res, next) => {
    try {
      const {value, error} = validate.userLoginSchema.validate(req.body);
      if (error) {
        throw new ResponseError(error.message, 400);
      }

      // check if user exists
      const user = await this.userService.findByEmailLogin(value.email);
      if (!user) {
        throw new ResponseError('Invalid email or password', 400);
      }

      // compare password
      const isMatch = await this.services.comparePassword(
        value.password,
        user.password,
      );
      if (!isMatch) {
        throw new ResponseError('Invalid email or password', 400);
      }

      // delete refresh token if exists for user
      await this.userService.deleteRefreshTokenByUserId(user._id);

      // create access and refresh token
      const tokens = await this.services.createAccessAndRefreshToken({
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          emailVerified: user.emailVerified,
          profile: user.profile,
          status: user?.inovator?.status,
        },
      });
      return ResponseApi.success(res, tokens);
    } catch (error) {
      next(error);
    }
  };

  // refresh token
  refreshToken = async (req, res, next) => {
    try {
      const {refreshToken} = req.body;
      if (!refreshToken) {
        throw new ResponseError('Refresh token is required', 400);
      }
      // find refresh token
      const token = await this.services.findRefreshToken(refreshToken);
      if (!token) {
        throw new ResponseError('Invalid refresh token', 400);
      }

      // verify or delete refresh token
      const Token = await this.services.verifyOrDeleteRefreshToken(token);

      // delete refresh token if exists for user
      await this.userService.deleteRefreshTokenByUserId(Token.user._id);

      const user = await this.userService.findById(Token.user._id);

      // create access and refresh token
      const tokens = await this.services.createAccessAndRefreshToken({
        user: user,
      });

      return ResponseApi.success(res, tokens);
    } catch (error) {
      next(error);
    }
  };

  // logout user
  logout = async (req, res, next) => {
    try {
      // get user from request
      const user = req.user;
      // delete refresh token if exists for user
      await this.userService.deleteRefreshTokenByUserId(user._id);
      return ResponseApi.noContent(res);
    } catch (error) {
      next(error);
    }
  };

  // send email verification token
  sendEmailVerification = async (req, res, next) => {
    try {
      // get user from request
      const user = req.user;
      // check is user is already verified
      if (user.isVerified) {
        throw new ResponseError('Email is already verified', 400);
      }
      // create email verify token
      const token = await this.services.createEmailVerifyToken(user._id);
      const link = `${config.email.verifyUrl}/${token}`;
      // send email
      await this.transporter.sendMail({
        from: config.email.user,
        to: user.email,
        subject: 'Email Verification | Inovasi Itera',
        html: emailVerifyTemplate(user.email, link, 'email'),
      });

      return ResponseApi.noContent(res);
    } catch (error) {
      next(error);
    }
  };

  // forgot password
  forgotPassword = async (req, res, next) => {
    try {
      const {email} = req.body;
      if (!email) {
        throw new ResponseError('Email is required', 400);
      }

      // check if user exists
      const user = await this.userService.findByEmailLogin(email);
      if (!user.length) {
        throw new ResponseError('Invalid email', 400);
      }

      // create reset token
      const resetToken = await this.services.createResetPasswordToken(user._id);
      // send email
      const link = `${config.email.reseturl}?token=${resetToken}`;
      await this.transporter.sendMail({
        from: config.email.user,
        to: user.email,
        subject: 'Reset Password',
        html: emailVerifyTemplate(user.email, link, 'Reset'),
      });

      return ResponseApi.noContent(res);
    } catch (error) {
      next(error);
    }
  };

  // reset password
  resetPassword = async (req, res, next) => {
    try {
      const {value, error} = validate.userResetPasswordSchema.validate(
        req.body,
      );
      const {token} = req.params;
      if (error) {
        throw new ResponseError(error.message, 400);
      }
      const {password} = value;

      // get reset token
      const user = await this.services.getAndVerifyResetPasswordToken(token);

      // hash password
      const hashedPassword = await this.services.hashPassword(password);
      // update password
      user.password = hashedPassword;
      await user.save();
      // delete reset token
      await this.services.deleteResetPasswordToken(token);
      // redirect to frontend
      return ResponseApi.success(res, {message: 'password updated'});
    } catch (error) {
      next(error);
    }
  };

  // resend email verification
  resendEmail = async (req, res, next) => {
    try {
      // get user from request
      const user = req.user;
      // create email verify token
      const token = await this.services.createEmailVerifyToken(user._id);
      const link = `${config.email.verifyUrl}/${token}`;
      // send email
      await this.transporter.sendMail({
        from: config.email.user,
        to: user.email,
        subject:
          'Email Verification | ICSSF Institute Technology Sumatera 2024',
        html: emailVerifyTemplate(user.email, link, 'email'),
      });
      return ResponseApi.noContent(res);
    } catch (error) {
      next(error);
    }
  };

  // confirm email
  confirmEmail = async (req, res, next) => {
    try {
      const {token} = req.params;
      if (!token) {
        throw new ResponseError('Token is required', 400);
      }
      // get email verify token
      const user = await this.services.getAndVerifyEmailVerifyToken(token);
      if (!user) {
        throw new ResponseError('Invalid token', 400);
      }
      // get user by id

      // check if user is already verified
      if (user.emailVerified) {
        throw new ResponseError('Email is already verified', 400);
      }
      // update verification status
      user.emailVerified = true;

      // craete access and refresh token

      const tokens = await this.services.createAccessAndRefreshToken({
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          emailVerified: user.emailVerified,
          profile: user.profile,
          status: user?.inovator?.status,
        },
      });

      // delete email verify token
      await this.services.deleteEmailVerifyToken(token);
      // redirect to frontend
      return ResponseApi.success(res, {tokens});
    } catch (error) {
      next(error);
    }
  };

  // login with google with code from frontend

  loginWithGoogle = async (req, res, next) => {
    try {
      const {code} = req.body;
      if (!code) {
        throw new ResponseError('Code is required', 400);
      }

      // get access token from google
      const accessToken = await this.services.getGoogleAccessToken(code);

      // get user info from google
      const userInfo = await this.services.getGoogleUserInfo(accessToken);

      // check if user exists
      const user = await this.userService.verifyGoogleAccount(userInfo);

      // create access and refresh token
      const tokens = await this.services.createAccessAndRefreshToken({
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          emailVerified: user.emailVerified,
          profile: user.profile,
          status: user?.inovator?.status,
        },
      });
      return ResponseApi.success(res, tokens);
    } catch (error) {
      next(error);
    }
  };

  me = async (req, res, next) => {
    try {
      const user = await this.userService.findById(req.user._id);
      return ResponseApi.success(res, user);
    } catch (error) {
      next(error);
    }
  };
}
