module.exports = (sequelize, DataTypes) => {
  const ProfilePicture = sequelize.define("ProfilePicture", {
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
    pathThumb: {
      type: DataTypes.STRING,
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

  ProfilePicture.associate = (models) => {
    ProfilePicture.belongsTo(models.User, {
      foreignKey: {
        name: "userId",
      },
    });
  };

  return ProfilePicture;
};
