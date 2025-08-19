'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 12);

    await queryInterface.bulkInsert(
      'Users',
      [
        {
          email: 'admin@example.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: 'user@example.com',
          password: await bcrypt.hash('user123', 12),
          firstName: 'Test',
          lastName: 'User',
          role: 'user',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'Users',
      {
        email: ['admin@example.com', 'user@example.com']
      },
      {}
    );
  }
};
