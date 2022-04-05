import { Sequelize, Model, DataTypes, Optional } from "sequelize";

export function initSeasonDetail(sequelize: Sequelize) {
  const SeasonDetail = sequelize.define("SeasonDetail", {
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isPaused: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    pointThresholdForFlight: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    numberOfFlightsForShirt: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gliderClasses: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    flightTypeFactors: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    rankingClasses: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    seniorStartAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    seniorBonusPerAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    activeRankings: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: ["overall", "ladies", "club", "team"],
      // All current options: ["overall", "ladies", "club", "team","seniors","newcomer","fun","sundays","RP","LUX","earlyBird","lateBird"]
    },
    misc: {
      type: DataTypes.JSON,
    },
  });
  return SeasonDetail;
}
