const { DataTypes } = require("sequelize");
const db = require("../config/postgres.js");

const Airspace = db.sequelize.define("Airspace", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  season: {
    type: DataTypes.INTEGER,
    defaultValue: new Date().getFullYear(),
  },
  class: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  floor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ceiling: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  polygon: {
    type: DataTypes.GEOMETRY("POLYGON"),
    allowNull: false,
  },
});

module.exports = Airspace;
