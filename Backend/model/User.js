const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/postgres.js");
const bcrypt = require("bcryptjs");
const Flight = require("./Flight.js");
const FlightComment = require("./FlightComment");

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

User.hasMany(Flight, {
  as: "flights",
  foreignKey: {
    name: "userId",
    allowNull: false,
  },
});

User.hasMany(FlightComment, {
  as: "comments",
  foreignKey: {
    name: "userId",
    allowNull: false,
  },
  onDelete: "CASCADE",
  hooks: true,
});

User.getNames = getNames;

module.exports = User;
