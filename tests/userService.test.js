const UserService = require('../src/services/userService');
const User = require('../src/models/User');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// Mock dependencies
jest.mock('../src/models/User');
jest.mock('bcryptjs');
jest.mock('../src/config/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPaginatedUsers', () => {
    const mockUsers = [
      { id: 1, email: 'user1@example.com', firstName: 'John', lastName: 'Doe' },
      { id: 2, email: 'user2@example.com', firstName: 'Jane', lastName: 'Smith' }
    ];

    it('should return paginated users with default options', async () => {
      User.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockUsers
      });

      const result = await UserService.getPaginatedUsers();

      expect(User.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });

      expect(result).toEqual({
        users: mockUsers,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1
        }
      });
    });

    it('should apply search filter', async () => {
      User.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockUsers[0]]
      });

      const options = { search: 'john' };
      await UserService.getPaginatedUsers(options);

      expect(User.findAndCountAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { email: { [Op.like]: '%john%' } },
            { firstName: { [Op.like]: '%john%' } },
            { lastName: { [Op.like]: '%john%' } }
          ]
        },
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
    });

    it('should apply role filter', async () => {
      User.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockUsers[0]]
      });

      const options = { role: 'admin' };
      await UserService.getPaginatedUsers(options);

      expect(User.findAndCountAll).toHaveBeenCalledWith({
        where: { role: 'admin' },
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
    });

    it('should apply isActive filter', async () => {
      User.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockUsers[0]]
      });

      const options = { isActive: 'true' };
      await UserService.getPaginatedUsers(options);

      expect(User.findAndCountAll).toHaveBeenCalledWith({
        where: { isActive: true },
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
    });

    it('should handle pagination correctly', async () => {
      User.findAndCountAll.mockResolvedValue({
        count: 25,
        rows: mockUsers
      });

      const options = { page: 3, limit: 5 };
      const result = await UserService.getPaginatedUsers(options);

      expect(User.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        limit: 5,
        offset: 10, // (3-1) * 5
        order: [['createdAt', 'DESC']]
      });

      expect(result.pagination).toEqual({
        page: 3,
        limit: 5,
        total: 25,
        pages: 5
      });
    });

    it('should limit maximum page size to 100', async () => {
      User.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockUsers
      });

      const options = { limit: 200 };
      await UserService.getPaginatedUsers(options);

      expect(User.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        limit: 100, // Limited to max
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
    });
  });

  describe('getUserWithAccessControl', () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    const adminUser = { id: 2, role: 'admin' };
    const regularUser = { id: 1, role: 'user' };
    const otherUser = { id: 3, role: 'user' };

    it('should allow admin to view any user', async () => {
      User.findByPk.mockResolvedValue(mockUser);

      const result = await UserService.getUserWithAccessControl(1, adminUser);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should allow user to view their own profile', async () => {
      User.findByPk.mockResolvedValue(mockUser);

      const result = await UserService.getUserWithAccessControl(1, regularUser);

      expect(result).toEqual(mockUser);
    });

    it('should deny user access to other profiles', async () => {
      await expect(UserService.getUserWithAccessControl(1, otherUser))
        .rejects.toThrow('Access denied');

      expect(User.findByPk).not.toHaveBeenCalled();
    });

    it('should throw error for non-existent user', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(UserService.getUserWithAccessControl(999, adminUser))
        .rejects.toThrow('User not found');
    });
  });

  describe('updateUserProfile', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      update: jest.fn()
    };
    const adminUser = { id: 2, role: 'admin' };
    const regularUser = { id: 1, role: 'user' };
    const otherUser = { id: 3, role: 'user' };

    beforeEach(() => {
      mockUser.update.mockClear();
    });

    it('should allow admin to update any user', async () => {
      User.findByPk.mockResolvedValue(mockUser);
      User.findOne.mockResolvedValue(null); // No email conflict

      const updateData = { firstName: 'Jane', email: 'jane@example.com' };
      
      mockUser.update.mockResolvedValue(true);

      const result = await UserService.updateUserProfile(1, updateData, adminUser);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(mockUser.update).toHaveBeenCalledWith({
        firstName: 'Jane',
        email: 'jane@example.com'
      });
      expect(result).toEqual(mockUser);
    });

    it('should allow user to update their own profile', async () => {
      User.findByPk.mockResolvedValue(mockUser);
      User.findOne.mockResolvedValue(null);

      const updateData = { firstName: 'Jane' };
      mockUser.update.mockResolvedValue(true);

      const result = await UserService.updateUserProfile(1, updateData, regularUser);

      expect(mockUser.update).toHaveBeenCalledWith({
        firstName: 'Jane'
      });
      expect(result).toEqual(mockUser);
    });

    it('should deny user access to update other profiles', async () => {
      await expect(UserService.updateUserProfile(1, {}, otherUser))
        .rejects.toThrow('Access denied');

      expect(User.findByPk).not.toHaveBeenCalled();
    });

    it('should throw error for non-existent user', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(UserService.updateUserProfile(999, {}, adminUser))
        .rejects.toThrow('User not found');
    });

    it('should check for email conflicts when updating email', async () => {
      User.findByPk.mockResolvedValue(mockUser);
      User.findOne.mockResolvedValue({ id: 999 }); // Email already taken

      const updateData = { email: 'taken@example.com' };

      await expect(UserService.updateUserProfile(1, updateData, adminUser))
        .rejects.toThrow('Email is already taken');

      expect(User.findOne).toHaveBeenCalledWith({
        where: {
          email: 'taken@example.com',
          id: { [Op.ne]: 1 }
        }
      });
    });

    it('should not update undefined fields', async () => {
      User.findByPk.mockResolvedValue(mockUser);
      User.findOne.mockResolvedValue(null);

      const updateData = { firstName: 'Jane', lastName: undefined };
      mockUser.update.mockResolvedValue(true);

      await UserService.updateUserProfile(1, updateData, adminUser);

      expect(mockUser.update).toHaveBeenCalledWith({
        firstName: 'Jane'
        // lastName should not be included
      });
    });
  });

  describe('deleteUser', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      destroy: jest.fn()
    };
    const adminUser = { id: 2, role: 'admin' };

    beforeEach(() => {
      mockUser.destroy.mockClear();
    });

    it('should delete user successfully', async () => {
      User.findByPk.mockResolvedValue(mockUser);
      mockUser.destroy.mockResolvedValue(true);

      const result = await UserService.deleteUser(1, adminUser);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(mockUser.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw error for non-existent user', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(UserService.deleteUser(999, adminUser))
        .rejects.toThrow('User not found');
    });

    it('should prevent admin from deleting themselves', async () => {
      const selfUser = { id: 1, email: 'admin@example.com' };
      User.findByPk.mockResolvedValue(selfUser);

      await expect(UserService.deleteUser(1, { id: 1 }))
        .rejects.toThrow('Cannot delete your own account');

      // Don't check destroy method as it's not mocked
    });
  });

  describe('changePassword', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedOldPassword',
      update: jest.fn()
    };

    beforeEach(() => {
      mockUser.update.mockClear();
    });

    it('should change password successfully', async () => {
      User.scope.mockReturnValue({
        findByPk: jest.fn().mockResolvedValue(mockUser)
      });
      
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('hashedNewPassword');
      mockUser.update.mockResolvedValue(true);

      const result = await UserService.changePassword(1, 'oldPassword', 'newPassword');

      expect(User.scope).toHaveBeenCalledWith('withPassword');
      expect(bcrypt.compare).toHaveBeenCalledWith('oldPassword', 'hashedOldPassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 12);
      expect(mockUser.update).toHaveBeenCalledWith({ password: 'hashedNewPassword' });
      expect(result).toBe(true);
    });

    it('should throw error for incorrect current password', async () => {
      User.scope.mockReturnValue({
        findByPk: jest.fn().mockResolvedValue(mockUser)
      });
      
      bcrypt.compare.mockResolvedValue(false);

      await expect(UserService.changePassword(1, 'wrongPassword', 'newPassword'))
        .rejects.toThrow('Current password is incorrect');

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUser.update).not.toHaveBeenCalled();
    });
  });
});
