const { DataTypes } = require("sequelize");
const db = require("../config/postgres.js");

const FlightFixes = db.sequelize.define("FlightFixes", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  fixes: {
    type: DataTypes.JSON,
    allowNull: false,
  },
});

module.exports = FlightFixes;
