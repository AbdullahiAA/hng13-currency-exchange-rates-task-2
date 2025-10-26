const dbConfig = require("../config/db.config.js");
const { Sequelize, DataTypes } = require("sequelize");

// Create Sequelize instance
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: dbConfig.pool,
});

// Test the connection
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ DB connection failed:", err));

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.country = require("./country.model.js")(sequelize, DataTypes);
db.refreshMetadata = require("./refreshMetadata.model.js")(
  sequelize,
  DataTypes
);

module.exports = db;
