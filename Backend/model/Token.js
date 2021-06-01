const { DataTypes } = require("sequelize");
const db = require("../config/postgres.js");

const Token = db.sequelize.define("Token", {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Token;
