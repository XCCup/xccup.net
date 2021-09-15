const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
        type: DataTypes.DATEONLY,
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

  User.associate = (models) => {
    User.hasMany(models.Flight, {
      as: "flights",
      foreignKey: {
        name: "userId",
      },
    });
    User.hasMany(models.FlightComment, {
      as: "comments",
      foreignKey: {
        name: "userId",
        //Through this constrain it's realized that every comment, will be delete if the user will be deleted
        allowNull: false,
      },
      onDelete: "CASCADE",
      hooks: true,
    });
    User.belongsTo(models.Club, {
      foreignKey: {
        name: "clubId",
      },
    });
    User.belongsTo(models.Team, {
      foreignKey: {
        name: "teamId",
      },
    });
  };

  return User;
};
