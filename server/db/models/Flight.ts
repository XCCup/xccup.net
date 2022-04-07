import { Sequelize, Model, DataTypes, Optional } from "sequelize";

interface FlightAttributes {
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
  flightType?: "FREE" | "FLAT" | "FAI";
  flightStatus?:
    | "Nicht in Wertung"
    | "In Wertung"
    | "Flugbuch"
    | "In Bearbeitung";
  flightTurnpoints?: object; // TODO: Define this stricter
  airtime?: number;
  takeoffTime?: number;
  landingTime?: number;
  igcPath?: string;
  glider?: object; // TODO: Define this stricter
  airspaceViolation?: boolean;
  uncheckedGRecord?: boolean;
  violationAccepted?: boolean;
  hikeAndFly?: number;
  isWeekend?: boolean;
  region?: string;
  ageOfUser: number;
  homeStateOfUser?: string;
  flightStats?: object; // TODO: Define this stricter
}

interface FlightCreationAttributes extends Optional<FlightAttributes, "id"> {}

interface FlightInstance
  extends Model<FlightAttributes, FlightCreationAttributes>,
    FlightAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initFlight(sequelize: Sequelize) {
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
      // values: ["FREE", "FLAT", "FAI"],
    },
    flightStatus: {
      type: DataTypes.STRING,
      // values: ["Nicht in Wertung", "In Wertung", "Flugbuch", "In Bearbeitung"],
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
  });

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
        //Through this constrain it's realized that every comment, will be delete if the flight will be deleted
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
