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
    relatedTo: {
      type: DataTypes.UUID,
    },
  });

  FlightComment.associate = (models) => {
    FlightComment.belongsTo(models.User, {
      as: "user",
      foreignKey: {
        name: "userId",
      },
    });
  };

  return FlightComment;
};
