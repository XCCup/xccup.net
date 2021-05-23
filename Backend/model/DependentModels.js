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
    firstname: {
      type: DataTypes.STRING,
    },
    birthday: {
      type: DataTypes.STRING,
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
    instanceMethods: {
      validPassword: function (password) {
        return bcrypt.compareSync(password, this.password);
      },
    },
  }
);

const getNames = async () => {
  return User.findAll({
    attributes: ["name"],
  });
};

//-----------Flight-----------

const Flight = db.sequelize.define("Flight", {
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
  takeoff: {
    type: DataTypes.STRING(),
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
    // values: ["JOJO", "FLAT", "FAI"],
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
    type: DataTypes.STRING,
  },
  airspaceViolation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
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
    type: DataTypes.STRING,
    allowNull: false,
  },
});

//-----------Associations-----------

User.hasMany(Flight, {
  as: "flights",
});

User.hasMany(FlightComment, {
  as: "comments",
  foreignKey: {
    //Through this constrain it's realized that every comment, will be delete if the user will be deleted
    allowNull: false,
  },
  onDelete: "CASCADE",
  hooks: true,
});

Flight.hasMany(FlightComment, {
  as: "comments",
  foreignKey: {
    //Through this constrain it's realized that every comment, will be delete if the user will be deleted
    allowNull: false,
  },
  onDelete: "CASCADE",
  hooks: true,
});

Flight.belongsTo(User);
FlightComment.belongsTo(User);

Flight.hasOne(FlightFixes, {
  as: "fixes",
  foreignKey: {
    name: "FlightId",
    //Through this constrain it's realized that every comment, will be delete if the user will be deleted
    allowNull: false,
  },
  onDelete: "CASCADE",
  hooks: true,
});

User.getNames = getNames;

exports.Flight = Flight;
exports.FlightComment = FlightComment;
exports.User = User;
