const { sequelize } = require("../db");
const { DataTypes } = require("sequelize");

// Define the URL model
const shortUrl = sequelize.define("shortUrl", {
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  user: {
    type: DataTypes.INTEGER,
  },
});

module.exports = { shortUrl };
