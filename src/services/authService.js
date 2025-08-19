const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('./emailService');
const { logger } = require('../config/logger');

/**
 * Authentication Service
 * Contains pure business logic for authentication operations
 */
class AuthService {
  /**
   * Create a new user account
   */
  static async createUser(userData) {
    const { email, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName
    });

    logger.info(`New user registered: ${email}`);
    return user;
  }

  /**
   * Authenticate user credentials
   */
  static async authenticateUser(email, password) {
    const user = await User.scope('withPassword').findOne({ where: { email } });

    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    logger.info(`User logged in: ${email}`);
    return user;
  }

  /**
   * Generate JWT token for user
   */
  static generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE }
    );
  }

  /**
   * Change user password
   */
  static async changeUserPassword(userId, currentPassword, newPassword) {
    // Get user with password for comparison
    const user = await User.scope('withPassword').findByPk(userId);

    if (!(await user.comparePassword(currentPassword))) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    await user.update({ password: newPassword });

    logger.info(`Password changed for user: ${user.email}`);
    return true;
  }

  /**
   * Generate password reset token
   */
  static async generatePasswordResetToken(email) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // For security, don't reveal if email exists
      return { success: true, message: 'If the email exists, a password reset link has been sent' };
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
      return { success: true, message: 'Password reset email sent' };
    } catch (emailError) {
      logger.error('Email sending error:', emailError);
      // Reset the token if email fails
      await user.update({
        resetPasswordToken: null,
        resetPasswordExpires: null
      });
      
      throw new Error('Failed to send reset email');
    }
  }

  /**
   * Reset password with token
   */
  static async resetPasswordWithToken(token, newPassword) {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Update password and clear reset token
    await user.update({
      password: newPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    logger.info(`Password reset completed for user: ${user.email}`);
    return true;
  }
}

module.exports = AuthService;
