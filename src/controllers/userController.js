const { Op } = require('sequelize');
const User = require('../models/User');
const { logger } = require('../config/logger');

/**
 * User Controller
 * Handles user management business logic
 */
class UserController {
  /**
   * Get current user profile
   */
  static async getUserProfile(req, res) {
    try {
      res.json({
        success: true,
        data: req.user
      });
    } catch (error) {
      logger.error('Get user profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get all users with pagination and filtering (Admin only)
   */
  static async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 10, 100);
      const offset = (page - 1) * limit;
      const { search, role, isActive } = req.query;

      // Build where clause
      const where = {};

      if (search) {
        where[Op.or] = [
          { email: { [Op.like]: `%${search}%` } },
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } }
        ];
      }

      if (role) {
        where.role = role;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const { count, rows: users } = await User.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total: count,
            pages: totalPages
          }
        }
      });
    } catch (error) {
      logger.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Change current user password
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = req.user;

      // Verify current password
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);

      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await user.update({ password: hashedPassword });

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
   * Get user by ID
   */
  static async getUserById(req, res) {
    try {
      const { id } = req.params;

      // Users can only view their own profile unless they're admin
      if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req, res) {
    try {
      const { firstName, lastName, email } = req.body;
      const user = req.user;

      // Check if email is being changed and if it's already taken
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use'
          });
        }
      }

      // Update user
      await user.update({
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        email: email || user.email
      });

      logger.info(`Profile updated for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Update user by ID (Users can update own profile, Admin can update any user)
   */
  static async updateUserById(req, res) {
    try {
      const { id } = req.params;
      const { firstName, lastName, email } = req.body;

      // Users can only update their own profile unless they're admin
      if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if email is being changed and if it's already taken
      if (email && email !== user.email) {
        const { Op } = require('sequelize');
        const existingUser = await User.findOne({
          where: {
            email,
            id: { [Op.ne]: id }
          }
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email is already taken'
          });
        }
      }

      // Update user
      await user.update({
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email })
      });

      logger.info(`User updated: ${user.email}`);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      logger.error('Update user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Delete user by ID (Admin only)
   */
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent admin from deleting themselves
      if (user.id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      await user.destroy();

      logger.info(`User deleted by admin: ${user.email}`);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      logger.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = UserController;
