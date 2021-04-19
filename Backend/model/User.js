const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/postgres.js");
const bcrypt = require("bcrypt");

const User = db.sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, //Constrain on DB
      validate: {
        //Validation will be performed before any sql interaction happens
        notEmpty: true, //No empty string allowed
      },
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

User.getNames = getNames;

module.exports = User;
