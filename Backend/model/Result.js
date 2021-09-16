module.exports = (sequelize, DataTypes) => {
  const Result = sequelize.define("Result", {
    season: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING, //team, club, senior, newcomer
      allowNull: false,
    },
    result: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  });

  return Result;
};
