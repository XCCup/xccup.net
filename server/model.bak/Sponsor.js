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
    tagline: {
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
        allowNull: true,
      },
      onDelete: "CASCADE",
      hooks: true,
    });
  };

  return Sponsor;
};
