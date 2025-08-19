// Mock EmailService before importing
jest.mock('../src/services/emailService', () => ({
  sendWelcomeEmail: jest.fn(),
  sendPasswordReset: jest.fn()
}));

const AuthService = require('../src/services/authService');
const emailService = require('../src/services/emailService');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Mock dependencies
jest.mock('../src/models/User');
jest.mock('../src/services/emailService');
jest.mock('jsonwebtoken');
jest.mock('crypto');
jest.mock('../src/config/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up environment variables
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRE = '24h';
    process.env.FRONTEND_URL = 'http://localhost:3000';
  });

  describe('createUser', () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    it('should create a new user successfully', async () => {
      // Mock User.findOne to return null (user doesn't exist)
      User.findOne.mockResolvedValue(null);
      
      // Mock User.create to return created user
      const mockUser = { id: 1, ...userData };
      User.create.mockResolvedValue(mockUser);

      const result = await AuthService.createUser(userData);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(User.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user already exists', async () => {
      // Mock User.findOne to return existing user
      User.findOne.mockResolvedValue({ id: 1, email: userData.email });

      await expect(AuthService.createUser(userData))
        .rejects.toThrow('User with this email already exists');

      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('authenticateUser', () => {
    const email = 'test@example.com';
    const password = 'password123';

    it('should authenticate user with valid credentials', async () => {
      const mockUser = {
        id: 1,
        email,
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        update: jest.fn().mockResolvedValue(true)
      };

      User.scope.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockUser)
      });

      const result = await AuthService.authenticateUser(email, password);

      expect(User.scope).toHaveBeenCalledWith('withPassword');
      expect(mockUser.comparePassword).toHaveBeenCalledWith(password);
      expect(mockUser.update).toHaveBeenCalledWith({ lastLoginAt: expect.any(Date) });
      expect(result).toEqual(mockUser);
    });

    it('should throw error for invalid email', async () => {
      User.scope.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null)
      });

      await expect(AuthService.authenticateUser(email, password))
        .rejects.toThrow('Invalid email or password');
    });

    it('should throw error for invalid password', async () => {
      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      User.scope.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockUser)
      });

      await expect(AuthService.authenticateUser(email, password))
        .rejects.toThrow('Invalid email or password');
    });

    it('should throw error for inactive user', async () => {
      const mockUser = {
        isActive: false,
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      User.scope.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockUser)
      });

      await expect(AuthService.authenticateUser(email, password))
        .rejects.toThrow('Account is deactivated');
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const user = { id: 1, email: 'test@example.com' };
      const mockToken = 'mock-jwt-token';

      jwt.sign.mockReturnValue(mockToken);

      const result = AuthService.generateToken(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('changeUserPassword', () => {
    const userId = 1;
    const currentPassword = 'oldPassword';
    const newPassword = 'newPassword';

    it('should change password successfully', async () => {
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(true),
        update: jest.fn().mockResolvedValue(true)
      };

      User.scope.mockReturnValue({
        findByPk: jest.fn().mockResolvedValue(mockUser)
      });

      const result = await AuthService.changeUserPassword(userId, currentPassword, newPassword);

      expect(User.scope).toHaveBeenCalledWith('withPassword');
      expect(mockUser.comparePassword).toHaveBeenCalledWith(currentPassword);
      expect(mockUser.update).toHaveBeenCalledWith({ password: newPassword });
      expect(result).toBe(true);
    });

    it('should throw error for incorrect current password', async () => {
      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      User.scope.mockReturnValue({
        findByPk: jest.fn().mockResolvedValue(mockUser)
      });

      await expect(AuthService.changeUserPassword(userId, currentPassword, newPassword))
        .rejects.toThrow('Current password is incorrect');
    });
  });

  describe('generatePasswordResetToken', () => {
    const email = 'test@example.com';

    it('should generate reset token and send email successfully', async () => {
      const mockUser = {
        email,
        firstName: 'John',
        update: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);
      crypto.randomBytes.mockReturnValue({ toString: () => 'mock-token' });
      emailService.sendPasswordReset.mockResolvedValue(true);

      const result = await AuthService.generatePasswordResetToken(email);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(mockUser.update).toHaveBeenCalledWith({
        resetPasswordToken: 'mock-token',
        resetPasswordExpires: expect.any(Date)
      });
      expect(emailService.sendPasswordReset).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: 'Password reset email sent'
      });
    });

    it('should return success message for non-existent email', async () => {
      User.findOne.mockResolvedValue(null);

      const result = await AuthService.generatePasswordResetToken(email);

      expect(result).toEqual({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
      expect(emailService.sendPasswordReset).not.toHaveBeenCalled();
    });

    it('should handle email sending failure', async () => {
      const mockUser = {
        email,
        firstName: 'John',
        update: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);
      crypto.randomBytes.mockReturnValue({ toString: () => 'mock-token' });
      emailService.sendPasswordReset.mockRejectedValue(new Error('Email failed'));

      await expect(AuthService.generatePasswordResetToken(email))
        .rejects.toThrow('Failed to send reset email');

      // Should clear the token on email failure
      expect(mockUser.update).toHaveBeenCalledWith({
        resetPasswordToken: null,
        resetPasswordExpires: null
      });
    });
  });

  describe('resetPasswordWithToken', () => {
    const token = 'reset-token';
    const newPassword = 'newPassword';

    it('should reset password with valid token', async () => {
      const mockUser = {
        email: 'test@example.com',
        update: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);

      const result = await AuthService.resetPasswordWithToken(token, newPassword);

      expect(User.findOne).toHaveBeenCalledWith({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: {
            [require('sequelize').Op.gt]: expect.any(Date)
          }
        }
      });
      expect(mockUser.update).toHaveBeenCalledWith({
        password: newPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });
      expect(result).toBe(true);
    });

    it('should throw error for invalid or expired token', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(AuthService.resetPasswordWithToken(token, newPassword))
        .rejects.toThrow('Invalid or expired reset token');
    });
  });
});
