module.exports = (sequelize, DataTypes) => {
  const Sponsor = sequelize.define("Brand", {
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
    website: {
      type: DataTypes.STRING,
    },
  });

  Sponsor.associate = (models) => {
    Sponsor.hasOne(models.Logo, {
      as: "logo",
      foreignKey: {
        name: "brandId",
        allowNull: true,
      },
      onDelete: "CASCADE",
      hooks: true,
    });
  };

  return Sponsor;
};
