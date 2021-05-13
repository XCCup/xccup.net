const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/postgres.js");

const FlightComment = db.sequelize.define("FlightComment", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = FlightComment;
