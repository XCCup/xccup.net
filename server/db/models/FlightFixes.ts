import { Sequelize, Model, DataTypes, Optional } from "sequelize";

interface FlightFixesAttributes {
  id: string;
  geom: DataTypes.GeometryDataType;
  timeAndHeights: FlightFixTimeAndHeights;
  stats?: FlightFixStat;
}

interface FlightFixStat {
  speed: Number;
  climb: Number;
}

interface FlightFixTimeAndHeights {
  timestamp: Number;
  time: String;
  pressureAltitude: null | Number;
  gpsAltitude: Number;
  elevation?: number;
}

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

  FlightFixes.createGeometry = function (fixes) {
    // TODO: Where to find the postgis sequelize types?
    const coordinates = [];
    fixes.forEach((fix) => {
      coordinates.push([fix.longitude, fix.latitude]);
    });
    return {
      type: "LineString",
      coordinates,
    };
  };

  FlightFixes.extractTimeAndHeights = function (
    fixes: Object[]
  ): FlightFixTimeAndHeights[] {
    return fixes.map((fix: Object) => {
      return {
        timestamp: fix.timestamp,
        time: fix.time,
        pressureAltitude: fix.pressureAltitude,
        gpsAltitude: fix.gpsAltitude,
        elevation: fix.elevation,
      };
    });
  };

  FlightFixes.mergeData = function (fixes: FlightFixesAttributes) {
    if (!fixes) return [];

    const coordinates = fixes.geom.coordinates;
    const timeAndHeights = fixes.timeAndHeights;
    const stats = fixes.stats;

    const newOb = [...timeAndHeights];
    for (let i = 0; i < timeAndHeights.length; i++) {
      newOb[i].longitude = coordinates[i][0];
      newOb[i].latitude = coordinates[i][1];
      if (stats) {
        newOb[i].speed = stats[i].speed;
        newOb[i].climb = stats[i].climb;
      }
    }
    return newOb;
  };

  return FlightFixes;
}
