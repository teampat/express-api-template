const { sequelize } = require('../config/database');
const User = require('./User');

// Define associations here
// Example:
// User.hasMany(Post);
// Post.belongsTo(User);

const models = {
  User,
  sequelize
};

module.exports = models;
