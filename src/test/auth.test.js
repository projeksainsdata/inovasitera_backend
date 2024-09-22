import request from 'supertest';
import { app } from '../app.js'; // Assuming you have an Express app instance
import AuthService from '../services/auth.service.js';
import UserService from '../services/user.service.js';
import nodemailer from 'nodemailer';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

jest.mock('../services/auth.service.js');
jest.mock('../services/user.service.js');
jest.mock('nodemailer');

describe('AuthController', () => {
  let authServiceMock;
  let userServiceMock;
  let transporterMock;

  beforeEach(() => {
    authServiceMock = new AuthService();
    userServiceMock = new UserService();
    transporterMock = {
      sendMail: jest.fn().mockResolvedValue(true),
    };
    nodemailer.createTransport.mockReturnValue(transporterMock);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const user = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        
      };

      userServiceMock.findByEmailLogin.mockResolvedValue([]);
      authServiceMock.hashPassword.mockResolvedValue('hashedPassword');
      userServiceMock.createUser.mockResolvedValue(user);

      const response = await request(app)
        .post('/api/v1/register')
        .send(user);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(user);
    });

    it('should return 400 if user already exists', async () => {
      const user = {
        email: 'test@example.com',
        password: 'password123',
      };

      userServiceMock.findByEmailLogin.mockResolvedValue([user]);

      const response = await request(app)
        .post('/api/v1/register')
        .send(user);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const user = {
        email: 'test@example.com',
        password: 'password123',
      };

      userServiceMock.findByEmailLogin.mockResolvedValue([user]);
      authServiceMock.comparePassword.mockResolvedValue(true);
      authServiceMock.createAccessAndRefreshToken.mockResolvedValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });

      const response = await request(app)
        .post('/api/v1/login')
        .send(user);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });

    it('should return 400 if email or password is invalid', async () => {
      const user = {
        email: 'test@example.com',
        password: 'password123',
      };

      userServiceMock.findByEmailLogin.mockResolvedValue([]);

      const response = await request(app)
        .post('/api/v1/login')
        .send(user);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens', async () => {
      const refreshToken = 'validRefreshToken';
      const user = {
        _id: 'userId',
        email: 'test@example.com',
        username: 'testuser',
        role: 'member',
        emailVerified: true,
        profile: 'profileUrl',
      };

      authServiceMock.findRefreshToken.mockResolvedValue({ token: refreshToken });
      authServiceMock.verifyOrDeleteRefreshToken.mockResolvedValue({ user });
      userServiceMock.findById.mockResolvedValue(user);
      authServiceMock.createAccessAndRefreshToken.mockResolvedValue({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });

      const response = await request(app)
        .post('/api/v1/refresh-token')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });
    });

    it('should return 400 if refresh token is invalid', async () => {
      const refreshToken = 'invalidRefreshToken';

      authServiceMock.findRefreshToken.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/refresh-token')
        .send({ refreshToken });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid refresh token');
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      const user = { _id: 'userId' };

      userServiceMock.deleteRefreshTokenByUserId.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/v1/logout')
        .send({ user });

      expect(response.status).toBe(204);
    });
  });

  describe('sendEmailVerification', () => {
    it('should send email verification', async () => {
      const user = { _id: 'userId', email: 'test@example.com', isVerified: false };
      const token = 'emailVerifyToken';

      authServiceMock.createEmailVerifyToken.mockResolvedValue(token);

      const response = await request(app)
        .post('/api/v1/send-email-verification')
        .send({ user });

      expect(response.status).toBe(204);
      expect(transporterMock.sendMail).toHaveBeenCalled();
    });

    it('should return 400 if email is already verified', async () => {
      const user = { _id: 'userId', email: 'test@example.com', isVerified: true };

      const response = await request(app)
        .post('/api/v1/send-email-verification')
        .send({ user });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email is already verified');
    });
  });

  describe('forgotPassword', () => {
    it('should send reset password email', async () => {
      const email = 'test@example.com';
      const user = { _id: 'userId', email };
      const resetToken = 'resetToken';

      userServiceMock.findByEmailLogin.mockResolvedValue([user]);
      authServiceMock.createResetPasswordToken.mockResolvedValue(resetToken);

      const response = await request(app)
        .post('/api/v1/forgot-password')
        .send({ email });

      expect(response.status).toBe(204);
      expect(transporterMock.sendMail).toHaveBeenCalled();
    });

    it('should return 400 if email is invalid', async () => {
      const email = 'invalid@example.com';

      userServiceMock.findByEmailLogin.mockResolvedValue([]);

      const response = await request(app)
        .post('/api/v1/forgot-password')
        .send({ email });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email');
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      const token = 'resetToken';
      const password = 'newPassword';
      const user = { _id: 'userId', save: jest.fn() };

      authServiceMock.getAndVerifyResetPasswordToken.mockResolvedValue(user);
      authServiceMock.hashPassword.mockResolvedValue('hashedPassword');

      const response = await request(app)
        .post('/api/v1/reset-password')
        .send({ token, password });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('password updated');
      expect(user.save).toHaveBeenCalled();
    });

    it('should return 400 if token is invalid', async () => {
      const token = 'invalidToken';
      const password = 'newPassword';

      authServiceMock.getAndVerifyResetPasswordToken.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/reset-password')
        .send({ token, password });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid token');
    });
  });

  describe('confirmEmail', () => {
    it('should confirm email', async () => {
      const token = 'emailVerifyToken';
      const user = { _id: 'userId', emailVerified: false, save: jest.fn() };

      authServiceMock.getAndVerifyEmailVerifyToken.mockResolvedValue(user);
      authServiceMock.createAccessAndRefreshToken.mockResolvedValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });

      const response = await request(app)
        .get(`/api/v1/confirm-email/${token}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.tokens).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      expect(user.save).toHaveBeenCalled();
    });

    it('should return 400 if token is invalid', async () => {
      const token = 'invalidToken';

      authServiceMock.getAndVerifyEmailVerifyToken.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/v1/confirm-email/${token}`)
        .send();

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid token');
    });
  });

  describe('loginWithGoogle', () => {
    it('should login with Google', async () => {
      const code = 'googleAuthCode';
      const accessToken = 'googleAccessToken';
      const userInfo = { email: 'test@example.com' };
      const user = { _id: 'userId', email: 'test@example.com', username: 'testuser', role: 'member', emailVerified: true, profile: 'profileUrl' };

      authServiceMock.getGoogleAccessToken.mockResolvedValue(accessToken);
      authServiceMock.getGoogleUserInfo.mockResolvedValue(userInfo);
      userServiceMock.verifyGoogleAccount.mockResolvedValue([user]);
      authServiceMock.createAccessAndRefreshToken.mockResolvedValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });

      const response = await request(app)
        .post('/api/v1/login-google')
        .send({ code });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });

    it('should return 400 if code is missing', async () => {
      const response = await request(app)
        .post('/api/v1/login-google')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Code is required');
    });
  });

  describe('me', () => {
    it('should return user info', async () => {
      const user = { _id: 'userId', email: 'test@example.com', username: 'testuser', role: 'member', emailVerified: true, profile: 'profileUrl' };
  
      const response = await request(app)
        .get('/api/v1/me')
        .set('Authorization', `Bearer validAccessToken`) // Assuming you have a valid access token for the user
        .send();
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(user);
    });
  });
});