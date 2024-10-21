const { sequelize } = require("../db");
const { DataTypes } = require("sequelize");

// Define a User model
const User = sequelize.define(
  "User",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    forget_pass: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  {
    timestamps: true, // This will add the createdAt and updatedAt columns
  }
);

module.exports = { User };
