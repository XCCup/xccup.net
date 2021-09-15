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
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    factors: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    ratingClasses: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  });
  return SeasonDetail;
};
