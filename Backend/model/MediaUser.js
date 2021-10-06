module.exports = (sequelize, DataTypes) => {
  const MediaUser = sequelize.define("MediaUser", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    originalname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimetype: {
      type: DataTypes.STRING,
    },
    size: {
      type: DataTypes.BIGINT,
    },
  });

  MediaUser.associate = (models) => {
    MediaUser.belongsTo(models.User, {
      foreignKey: {
        name: "userId",
      },
    });
  };

  return MediaUser;
};
