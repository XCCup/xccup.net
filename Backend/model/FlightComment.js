module.exports = (sequelize, DataTypes) => {
  const FlightComment = sequelize.define("FlightComment", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },

    message: {
      type: DataTypes.STRING(2000),
      allowNull: false,
    },
  });

  FlightComment.associate = (models) => {
    FlightComment.belongsTo(models.User, {
      foreignKey: {
        name: "userId",
      },
    });
  };

  return FlightComment;
};
