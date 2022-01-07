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
    state: {
      type: DataTypes.STRING,
      // active, inactive, proposal
      defaultValue: "active",
    },
    website: {
      type: DataTypes.STRING,
    },
    submitter: {
      type: DataTypes.JSON,
    },
  });

  FlyingSite.associate = (models) => {
    FlyingSite.hasMany(models.Flight, {
      as: "flights",
      foreignKey: {
        name: "siteId",
      },
    });

    FlyingSite.belongsTo(models.Club, {
      as: "club",
      foreignKey: {
        name: "clubId",
      },
    });
  };

  return FlyingSite;
};
