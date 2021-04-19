const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/postgres.js");
const User = require("./User.js");

const Club = db.sequelize.define("Club", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  test1: {
    type: DataTypes.STRING,
  },
  test2: {
    type: DataTypes.STRING,
  },
  representiveId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id",
      comment: "This is a column links to the Users table",
    },
  },
});

module.exports = Club;
