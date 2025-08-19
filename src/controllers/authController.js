const AuthService = require('../services/authService');
const { logger } = require('../config/logger');
const { successResponse, errorResponse, createdResponse } = require('../utils');

/**
 * Auth Controller
 * Handles all authentication-related business logic
 */
class AuthController {
  /**
   * Register a new user
   */
  static async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;

      const user = await AuthService.createUser({ email, password, firstName, lastName });
      const token = AuthService.generateToken(user);

      return createdResponse(res, { user, token }, 'User registered successfully');
    } catch (error) {
      logger.error('Registration error:', error);
      
      if (error.message === 'User with this email already exists') {
        return errorResponse(res, error.message, 400);
      }

      return errorResponse(res, 'Internal server error', 500);
    }
  }

  /**
   * Login user
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await AuthService.authenticateUser(email, password);
      const token = AuthService.generateToken(user);

      return successResponse(res, { user, token }, 'Login successful');
    } catch (error) {
      logger.error('Login error:', error);
      
      if (error.message === 'Invalid email or password' || error.message === 'Account is deactivated') {
        return errorResponse(res, error.message, 401);
      }

      return errorResponse(res, 'Internal server error', 500);
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(req, res) {
    try {
      return successResponse(res, req.user, 'User profile retrieved successfully');
    } catch (error) {
      logger.error('Get current user error:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  }

  /**
   * Change user password
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      await AuthService.changeUserPassword(req.user.id, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Change password error:', error);
      
      if (error.message === 'Current password is incorrect') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      const result = await AuthService.generatePasswordResetToken(email);
      
      res.json(result);
    } catch (error) {
      logger.error('Forgot password error:', error);
      
      if (error.message === 'Failed to send reset email') {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      
      await AuthService.resetPasswordWithToken(token, newPassword);

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      
      if (error.message === 'Invalid or expired reset token') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = AuthController;
