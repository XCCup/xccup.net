const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/postgres.js");
const bcrypt = require("bcryptjs");
const FlightFixes = require("./FlightFixes.js");

//-----------User-----------

const User = db.sequelize.define(
  "User",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, //Constrain on DB
      validate: {
        //Validation will be performed before any sql interaction happens
        notEmpty: true, //No empty string allowed
      },
    },
    firstName: {
      type: DataTypes.STRING,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    birthday: {
      type: DataTypes.STRING,
    },
    urlProfilPicture: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "Keine",
    },
    gender: {
      type: DataTypes.STRING,
    },
    tshirtSize: {
      type: DataTypes.STRING,
    },
    gliders: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    emailInformIfComment: {
      type: DataTypes.BOOLEAN,
    },
    emailNewsletter: {
      type: DataTypes.BOOLEAN,
    },
    emailTeamSearch: {
      type: DataTypes.BOOLEAN,
    },
    state: {
      type: DataTypes.STRING,
      // The state the user lives in (e.g. RLP, NRW, LUX). Needed for possible state championships.
    },
    email: {
      type: DataTypes.STRING,
      // allowNull defaults to true
    },
    password: {
      type: DataTypes.STRING,
    },
  },
  {
    hooks: {
      beforeCreate: (user) => {
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(user.password, salt);
      },
    },
  }
);

//Define instance level methods for user
User.prototype.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const getNames = async () => {
  return User.findAll({
    attributes: ["name"],
  });
};

User.getNames = getNames;

//-----------Flight-----------

const Flight = db.sequelize.define(
  "Flight",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    externalId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      unique: true,
    },
    landing: {
      type: DataTypes.STRING(),
    },
    report: {
      type: DataTypes.STRING(5000), //Default is VARCHAR(255)
    },
    flightPoints: {
      type: DataTypes.INTEGER,
    },
    flightDistance: {
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
    igcUrl: {
      type: DataTypes.STRING,
    },
    imagesUrls: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    glider: {
      type: DataTypes.JSON,
    },
    airspaceViolation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    uncheckedGRecord: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    hikeAndFly: {
      //We will save the climbed height directly, so it's easier to aggreate later
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    dateOfFlight: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false,
    },
    isWeekend: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    hooks: {
      beforeCreate: (flight) => {
        const numberOfDay = flight.dateOfFlight.getDay();
        //TODO Evtl noch auf Feiertag prüfen?
        flight.isWeekend =
          numberOfDay == 5 || numberOfDay == 6 || numberOfDay == 0;
      },
    },
  }
);

//------------FlyingSite-------------
const FlyingSite = db.sequelize.define("FlyingSite", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
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
  },
  image: {
    type: DataTypes.STRING,
  },
  heightDifference: {
    type: DataTypes.INTEGER,
  },
});

//-----------FlightComment-----------

const FlightComment = db.sequelize.define("FlightComment", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },

  message: {
    type: DataTypes.STRING(2000),
    allowNull: false,
  },
});

//---------------Club----------------
const Club = db.sequelize.define("Club", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
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
  homepage: {
    type: DataTypes.STRING,
  },
  urlLogo: {
    type: DataTypes.STRING,
  },
  participantInSeasons: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
  },
  contacts: {
    type: DataTypes.ARRAY(DataTypes.JSON),
  },
});

//-----------Associations-----------

User.hasMany(Flight, {
  as: "flights",
  foreignKey: {
    name: "userId",
  },
});
User.hasMany(FlightComment, {
  as: "comments",
  foreignKey: {
    name: "userId",
    //Through this constrain it's realized that every comment, will be delete if the user will be deleted
    allowNull: false,
  },
  onDelete: "CASCADE",
  hooks: true,
});
User.belongsTo(Club, {
  foreignKey: {
    name: "clubId",
  },
});

Flight.belongsTo(User, {
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

FlightComment.belongsTo(User, {
  foreignKey: {
    name: "userId",
  },
});

Club.hasMany(User, {
  as: "members",
  foreignKey: {
    name: "clubId",
  },
});

FlyingSite.hasMany(Flight, {
  as: "flights",
  foreignKey: {
    name: "siteId",
  },
});

exports.Flight = Flight;
exports.FlightComment = FlightComment;
exports.FlyingSite = FlyingSite;
exports.Club = Club;
exports.User = User;
