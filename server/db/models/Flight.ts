import { Sequelize, Model, DataTypes, Optional } from "sequelize";
import {
  FLIGHT_STATE,
  FLIGHT_TYPE,
  UPLOAD_ENDPOINT,
  FlightStateType,
} from "../../constants/flight-constants";
import { FlightFixesAttributes } from "../../types/FlightFixes";
import { FlightStats } from "../../types/FlightStats";
import { Glider } from "../../types/Glider";
import { Models } from "../../types/Models";
import { UserAttributes } from "./User";

export interface FlightAttributes {
  id: string;
  externalId?: number;
  uploadEndpoint: UPLOAD_ENDPOINT;
  landing?: string;
  report?: string;
  airspaceComment?: string;
  flightPoints?: number;
  flightDistance?: number;
  flightDistanceFree?: number;
  flightDistanceFlat?: number;
  flightDistanceFAI?: number;
  flightMetarData?: string[];
  flightType?: FLIGHT_TYPE;
  flightStatus: string;
  flightTurnpoints?: FlightTurnpoint[];
  airtime?: number;
  takeoffTime?: Date;
  landingTime?: Date;
  igcPath?: string;
  glider?: Glider;
  airspaceViolation?: boolean;
  airspaceViolations?: AirspaceViolation[];
  uncheckedGRecord?: boolean;
  violationAccepted?: boolean;
  hikeAndFly?: number;
  isWeekend?: boolean;
  region?: string;
  ageOfUser: number;
  homeStateOfUser?: string;
  flightStats?: FlightStats;
  airbuddies?: Airbuddy[];
  isNewPersonalBest?: boolean;
  fixes?: FlightFixesAttributes;
}
interface Airbuddy {
  externalId?: number;
  correlationPercentage?: number;
  userFirstName?: string;
  userLastName?: string;
  userId?: string;
}
export interface FlightTurnpoint {
  time?: string;
  lat?: number;
  long?: number;
}

interface AirspaceViolation {
  lat: number;
  long: number;
  gpsAltitude: number;
  pressureAltitude: number;
  lowerLimit: number;
  upperLimit: number;
  airspaceName: string;
  timestamp: number;
}

interface FlightCreationAttributes extends Optional<FlightAttributes, "id"> {}
export interface FlightOutputAttributes extends FlightAttributes {
  userId: string;
  siteId?: string;
  clubId?: string;
  teamId?: string;
}
export interface FlightInstance
  extends Model<FlightAttributes, FlightCreationAttributes>,
    FlightOutputAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}
export interface FlightInstanceUserInclude extends FlightInstance {
  user: UserAttributes;
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
    uploadEndpoint: {
      type: DataTypes.STRING,
    },
    landing: {
      type: DataTypes.STRING,
    },
    report: {
      type: DataTypes.STRING(12000),
      //Default is VARCHAR(255)
    },
    airspaceComment: {
      type: DataTypes.STRING(1024),
    },
    flightPoints: {
      type: DataTypes.INTEGER,
    },
    flightDistance: {
      type: DataTypes.DOUBLE,
    },
    // Separate flightDistances are not used at the moment but should prepare the DB for upcoming changes
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
      defaultValue: FLIGHT_STATE.IN_PROCESS,
    },
    flightTurnpoints: {
      type: DataTypes.JSON,
    },
    flightMetarData: {
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
    airspaceViolations: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
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
      //We will save the climbed height directly, so it's easier to aggregate later
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isWeekend: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    airbuddies: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
    },
    isNewPersonalBest: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
