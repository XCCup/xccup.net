module.exports = (sequelize, DataTypes) => {
  const Club = sequelize.define("Club", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shortName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    homepage: {
      type: DataTypes.STRING,
    },
    urlLogo: {
      type: DataTypes.STRING,
    },
    participantInSeasons: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    contacts: {
      type: DataTypes.ARRAY(DataTypes.JSON),
    },
  });

  Club.associate = (models) => {
    Club.hasMany(models.User, {
      as: "members",
      foreignKey: {
        name: "clubId",
      },
    });
  };

  return Club;
};
