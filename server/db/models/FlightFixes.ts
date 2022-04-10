import { Sequelize, Model, DataTypes, Optional } from "sequelize";
import { FlightFixesAttributes } from "../../types/FlightFixesTypes";

interface FlightFixesCreationAttributes
  extends Optional<FlightFixesAttributes, "id"> {}

export interface FlightFixesInstance
  extends Model<FlightFixesAttributes, FlightFixesCreationAttributes>,
    FlightFixesAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initFlightFixes(sequelize: Sequelize) {
  const FlightFixes = sequelize.define<FlightFixesInstance>("FlightFixes", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    // TODO: Change this name to geometry?
    geom: {
      type: DataTypes.GEOMETRY("LINESTRING"),
      //Stores the lat/long information of the track
      allowNull: false,
    },
    timeAndHeights: {
      type: DataTypes.ARRAY(DataTypes.JSON),
      //Stores the height information (elevation, pressureAltitude, gpsAltitude) and time/timestamp of the track
      allowNull: false,
    },
    stats: {
      type: DataTypes.ARRAY(DataTypes.JSON),
      //Stores information about climbrate and speed of the track
    },
    /**
     * lineString and time, heights, stats data must correspond over indexes
     */
  });

  return FlightFixes;
}
