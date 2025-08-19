const { Op } = require('sequelize');
const User = require('../models/User');
const { logger } = require('../config/logger');

/**
 * User Service
 * Contains pure business logic for user management operations
 */
class UserService {
  /**
   * Get paginated users with filtering
   */
  static async getPaginatedUsers(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive
    } = options;

    const offset = (page - 1) * Math.min(limit, 100);
    const actualLimit = Math.min(limit, 100);

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
      limit: actualLimit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / actualLimit);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: actualLimit,
        total: count,
        pages: totalPages
      }
    };
  }

  /**
   * Get user by ID with access control
   */
  static async getUserWithAccessControl(userId, requestingUser) {
    // Users can only view their own profile unless they're admin
    if (requestingUser.role !== 'admin' && requestingUser.id !== parseInt(userId)) {
      throw new Error('Access denied');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId, updateData, requestingUser) {
    // Users can only update their own profile unless they're admin
    if (requestingUser.role !== 'admin' && requestingUser.id !== parseInt(userId)) {
      throw new Error('Access denied');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { firstName, lastName, email } = updateData;

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: userId }
        }
      });

      if (existingUser) {
        throw new Error('Email is already taken');
      }
    }

    // Update user
    await user.update({
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(email !== undefined && { email })
    });

    logger.info(`User updated: ${user.email}`);
    return user;
  }

  /**
   * Delete user (Admin only)
   */
  static async deleteUser(userId, requestingUser) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent admin from deleting themselves
    if (user.id === requestingUser.id) {
      throw new Error('Cannot delete your own account');
    }

    await user.destroy();
    logger.info(`User deleted by admin: ${user.email}`);
    return true;
  }

  /**
   * Change user password
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.scope('withPassword').findByPk(userId);
    
    // Verify current password
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await user.update({ password: hashedPassword });

    logger.info(`Password changed for user: ${user.email}`);
    return true;
  }
}

module.exports = UserService;
