import { Sequelize, Model, DataTypes, Optional } from "sequelize";

interface AirspaceAttributes {
  id: string;
  season: number;
  class: string;
  name: string;
  floor: string;
  ceiling: string;
  polygon: Object; //GeoJSON
}

interface AirspaceCreationAttributes
  extends Optional<AirspaceAttributes, "id"> {}

export interface AirspaceInstance
  extends Model<AirspaceAttributes, AirspaceCreationAttributes>,
    AirspaceAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initAirspace(sequelize: Sequelize) {
  const Airspace = sequelize.define<AirspaceInstance>("Airspace", {
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
}
