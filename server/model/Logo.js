module.exports = (sequelize, DataTypes) => {
  const Logo = sequelize.define("Logo", {
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
    },
    mimetype: {
      type: DataTypes.STRING,
    },
    size: {
      type: DataTypes.BIGINT,
    },
  });

  Logo.associate = (models) => {
    Logo.belongsTo(models.Sponsor, {
      foreignKey: {
        name: "sponsorId",
      },
    });
  };

  Logo.associate = (models) => {
    Logo.belongsTo(models.Sponsor, {
      foreignKey: {
        name: "brandId",
      },
    });
  };

  return Logo;
};
