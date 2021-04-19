const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/postgres.js");
const FlightComment = require("./FlightComment.js");

const Flight = db.sequelize.define("Flight", {
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

Flight.hasMany(FlightComment, {
  as: "comments",
  foreignKey: {
    name: "flightId",
    allowNull: false,
  },
  onDelete: "CASCADE",
  hooks: true,
});

module.exports = Flight;
