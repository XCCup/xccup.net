module.exports = (sequelize, DataTypes) => {
  const Sponsor = sequelize.define("Sponsor", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "OTHER", //MANUFACTURER, SCHOOL, HOLIDAY
    },
    website: {
      type: DataTypes.STRING,
    },
    isGoldSponsor: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sponsorInSeasons: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    contacts: {
      type: DataTypes.JSON,
    },
  });

  Sponsor.associate = (models) => {
    Sponsor.hasOne(models.Logo, {
      as: "logo",
      foreignKey: {
        name: "sponsorId",
        //Through this constrain it's realized that every comment, will be delete if the user will be deleted
        allowNull: false,
      },
      onDelete: "CASCADE",
      hooks: true,
    });
  };

  return Sponsor;
};
