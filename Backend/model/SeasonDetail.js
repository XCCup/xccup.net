module.exports = (sequelize, DataTypes) => {
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
    ratingClasses: {
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
  });
  return SeasonDetail;
};
