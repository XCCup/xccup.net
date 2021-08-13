const { DataTypes } = require("sequelize");
const db = require("../config/postgres.js");

const SeasonDetail = db.sequelize.define("SeasonDetail", {
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pointThresholdForFlight: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  numberOfFlightsForShirt:{
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  active:{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  factors:{
    type: DataTypes.JSON,
    allowNull: false,
  }
});

module.exports = SeasonDetail;
