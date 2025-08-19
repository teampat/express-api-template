const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { logger } = require('../config/logger');
const emailService = require('../services/emailService');

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

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      const user = await User.create({
        email,
        password,
        firstName,
        lastName
      });

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
      });

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Login user
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.scope('withPassword').findOne({ where: { email } });

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Update last login
      await user.update({ lastLoginAt: new Date() });

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
      });

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          token
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(req, res) {
    try {
      res.json({
        success: true,
        data: req.user
      });
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Change user password
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = req.user;

      // Get user with password for comparison
      const userWithPassword = await User.scope('withPassword').findByPk(user.id);

      if (!(await userWithPassword.comparePassword(currentPassword))) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      await userWithPassword.update({ password: newPassword });

      logger.info(`Password changed for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Change password error:', error);
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

      const user = await User.findOne({ where: { email } });

      if (!user) {
        // For security, don't reveal if email exists
        return res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await user.update({
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry
      });

      // Send reset email
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      try {
        await emailService.sendPasswordReset(user.email, {
          name: user.firstName || 'User',
          resetUrl
        });

        logger.info(`Password reset email sent to: ${email}`);
      } catch (emailError) {
        logger.error('Email sending error:', emailError);
        // Reset the token if email fails
        await user.update({
          resetPasswordToken: null,
          resetPasswordExpires: null
        });
        
        return res.status(500).json({
          success: false,
          message: 'Failed to send reset email'
        });
      }

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
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

      const user = await User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: {
            [require('sequelize').Op.gt]: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Update password and clear reset token
      await user.update({
        password: newPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });

      logger.info(`Password reset completed for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = AuthController;
