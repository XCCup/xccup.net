module.exports = (sequelize, DataTypes) => {
  const FlyingSite = sequelize.define("FlyingSite", {
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
    direction: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    point: {
      type: DataTypes.GEOMETRY("POINT", 4326),
      allowNull: false,
      /*
          We will use GEOMETRY on purpose. GEOGRAPHY would be more accurate, but also much slower.
      */
    },
    type: {
      type: DataTypes.STRING,
    },
    club: {
      type: DataTypes.STRING,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    image: {
      type: DataTypes.STRING,
    },
    heightDifference: {
      type: DataTypes.INTEGER,
    },
  });

  FlyingSite.associate = (models) => {
    FlyingSite.hasMany(models.Flight, {
      as: "flights",
      foreignKey: {
        name: "siteId",
      },
    });
  };

  return FlyingSite;
};
