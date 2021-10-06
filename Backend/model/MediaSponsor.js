module.exports = (sequelize, DataTypes) => {
  const MediaSponsor = sequelize.define("MediaSponsor", {
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

  MediaSponsor.associate = (models) => {
    MediaSponsor.belongsTo(models.Sponsor, {
      foreignKey: {
        name: "sponsorId",
      },
    });
  };

  return MediaSponsor;
};
