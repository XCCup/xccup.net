module.exports = (sequelize, DataTypes) => {
  const Flight = sequelize.define(
    "Flight",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
        defaultValue: DataTypes.NOW,
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

  Flight.associate = (models) => {
    Flight.belongsTo(models.User, {
      foreignKey: {
        name: "userId",
      },
    });
    Flight.belongsTo(models.FlyingSite, {
      as: "takeoff",
      foreignKey: {
        name: "siteId",
      },
    });
    Flight.hasMany(models.FlightComment, {
      as: "comments",
      foreignKey: {
        name: "flightId",
        //Through this constrain it's realized that every comment, will be delete if the flight will be deleted
        allowNull: false,
      },
      onDelete: "CASCADE",
      hooks: true,
    });
    Flight.hasOne(models.FlightFixes, {
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
};
