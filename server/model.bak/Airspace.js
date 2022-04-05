module.exports = (sequelize, DataTypes) => {
  const Airspace = sequelize.define("Airspace", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    season: {
      type: DataTypes.INTEGER,
      defaultValue: new Date().getFullYear(),
    },
    class: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    floor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ceiling: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    polygon: {
      type: DataTypes.GEOMETRY(),
      allowNull: false,
    },
  });
  return Airspace;
};
