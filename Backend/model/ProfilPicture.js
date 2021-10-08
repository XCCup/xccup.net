module.exports = (sequelize, DataTypes) => {
  const ProfilPicture = sequelize.define("ProfilPicture", {
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

  ProfilPicture.associate = (models) => {
    ProfilPicture.belongsTo(models.User, {
      foreignKey: {
        name: "userId",
      },
    });
  };

  return ProfilPicture;
};
