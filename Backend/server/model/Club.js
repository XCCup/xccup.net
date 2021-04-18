const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/postgres.js");

const User = db.sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    // allowNull defaults to true
  },
});

module.exports = User;
