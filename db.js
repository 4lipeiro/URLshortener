const { Sequelize } = require("sequelize");

// Initialize Sequelize
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite",
});

// Synchronize the model with the database
sequelize
  .sync({ force: false }) // force: true will drop the table if it already exists
  .then(() => {
    console.log("Database & tables created!");
  })
  .catch((error) => {
    console.error("Unable to sync database:", error);
  });

module.exports = { sequelize };
