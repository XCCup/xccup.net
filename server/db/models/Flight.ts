import { Sequelize, Model, DataTypes, Optional } from "sequelize";
import { FlightStats } from "../../types/FlightStats";
import { Models } from "../../types/Models";

export interface FlightAttributes {
  id: string;
  externalId?: number;
  landing?: string;
  report?: string;
  airspaceComment?: string;
  flightPoints?: number;
  flightDistance?: number;
  flightDistanceFree?: number;
  flightDistanceFlat?: number;
  flightDistanceFAI?: number;
  flightType?: FlightType;
  flightStatus?: FlightStatus;
  flightTurnpoints?: FlightTurnpoint[];
  airtime?: number;
  takeoffTime?: number;
  landingTime?: number;
  igcPath?: string;
  glider?: Glider;
  airspaceViolation?: boolean;
  uncheckedGRecord?: boolean;
  violationAccepted?: boolean;
  hikeAndFly?: number;
  isWeekend?: boolean;
  region?: string;
  ageOfUser: number;
  homeStateOfUser?: string;
  flightStats?: FlightStats;
}

interface FlightTurnpoint {
  time: string;
  lat: number;
  long: number;
}
// TODO: Get this from constants?
type FlightStatus =
  | "Nicht in Wertung"
  | "In Wertung"
  | "Flugbuch"
  | "In Bearbeitung";

type FlightType = "FREE" | "FLAT" | "FAI";

interface Glider {
  id: string;
  brand: string;
  model: string;
  gliderClass: {
    key: string;
    shortDescription: string;
  };
}

interface FlightCreationAttributes extends Optional<FlightAttributes, "id"> {}

export interface FlightOutputAttributes extends FlightAttributes {
  userId: string;
  siteId: string;
  clubId: string;
  teamId?: string;
}

export interface FlightInstance
  extends Model<FlightAttributes, FlightCreationAttributes>,
    FlightAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initFlight(sequelize: Sequelize): Models["Flight"] {
  const Flight = sequelize.define<FlightInstance>("Flight", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    externalId: {
      type: DataTypes.INTEGER,
      // autoIncrement: true, // Not supported on non PK column in Postgres
      unique: true,
    },
    landing: {
      type: DataTypes.STRING,
    },
    report: {
      type: DataTypes.STRING(12000),
      //Default is VARCHAR(255)
    },
    airspaceComment: {
      type: DataTypes.STRING,
    },
    flightPoints: {
      type: DataTypes.INTEGER,
    },
    flightDistance: {
      type: DataTypes.DOUBLE,
    },
    // Seperate flightDistances are not used at the moment but should prepare the DB for upcoming changes
    flightDistanceFree: {
      type: DataTypes.DOUBLE,
    },
    flightDistanceFlat: {
      type: DataTypes.DOUBLE,
    },
    flightDistanceFAI: {
      type: DataTypes.DOUBLE,
    },
    flightType: {
      type: DataTypes.STRING,
    },
    flightStatus: {
      type: DataTypes.STRING,
    },
    flightTurnpoints: {
      type: DataTypes.JSON,
    },
    airtime: {
      type: DataTypes.INTEGER,
      // In minutes
    },
    takeoffTime: {
      type: DataTypes.DATE,
    },
    landingTime: {
      type: DataTypes.DATE,
    },
    igcPath: {
      type: DataTypes.STRING,
    },
    glider: {
      type: DataTypes.JSONB,
    },
    airspaceViolation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    uncheckedGRecord: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    violationAccepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    hikeAndFly: {
      //We will save the climbed height directly, so it's easier to aggreate later
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isWeekend: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    region: {
      type: DataTypes.STRING,
    },
    ageOfUser: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    homeStateOfUser: {
      type: DataTypes.STRING,
    },
    flightStats: {
      type: DataTypes.JSON,
    },
  }) as Models["Flight"];

  Flight.associate = ({
    User,
    FlyingSite,
    Club,
    Team,
    FlightComment,
    FlightPhoto,
    FlightFixes,
  }) => {
    Flight.belongsTo(User, {
      as: "user",
      foreignKey: {
        name: "userId",
      },
    });
    Flight.belongsTo(FlyingSite, {
      as: "takeoff",
      foreignKey: {
        name: "siteId",
      },
    });
    Flight.belongsTo(Club, {
      as: "club",
      foreignKey: {
        name: "clubId",
      },
    });
    Flight.belongsTo(Team, {
      as: "team",
      foreignKey: {
        name: "teamId",
      },
    });
    Flight.hasMany(FlightComment, {
      as: "comments",
      foreignKey: {
        name: "flightId",
        // Through this constrain it's realized that every comment, will be delete if the flight will be deleted
        allowNull: false,
      },
      onDelete: "CASCADE",
      hooks: true,
    });
    Flight.hasMany(FlightPhoto, {
      as: "photos",
      foreignKey: {
        name: "flightId",
        //Through this constrain it's realized that every comment, will be delete if the flight will be deleted
        allowNull: false,
      },
      onDelete: "CASCADE",
      hooks: true,
    });
    Flight.hasOne(FlightFixes, {
      as: "fixes",
      foreignKey: {
        name: "flightId",
        //Through this constrain it's realized that every comment, will be delete if the user will be deleted
        allowNull: false,
      },
      onDelete: "CASCADE",
      hooks: true,
    });
  };

  return Flight;
}
