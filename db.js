const { Sequelize } = require("sequelize");

// Initialize Sequelize
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "database.sqlite",
  });

module.exports = { sequelize };