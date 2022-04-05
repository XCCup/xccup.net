import { Sequelize, Model, DataTypes, Optional } from "sequelize";

export function initAirspace(sequelize: Sequelize) {
  const attributes = {
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
  };

  const Airspace = sequelize.define("Airspace", attributes);
  return Airspace;
}
