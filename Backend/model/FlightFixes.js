const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/postgres.js");

const FlightFixes = db.sequelize.define("FlightFixes", {
  fixes: {
    type: DataTypes.JSON,
    allowNull: false,
  },
});

module.exports = FlightFixes;
