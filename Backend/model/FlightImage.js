module.exports = (sequelize, DataTypes) => {
  const FlightImage = sequelize.define("FlightImage", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pathThumb: {
      type: DataTypes.STRING,
    },
    originalname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(2000),
    },
    timestamp: {
      type: DataTypes.DATE,
    },
    mimetype: {
      type: DataTypes.STRING,
    },
    size: {
      type: DataTypes.BIGINT,
    },
    isYoutubeLink: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    likers: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
    },
  });

  FlightImage.associate = (models) => {
    FlightImage.belongsTo(models.User, {
      foreignKey: {
        name: "userId",
      },
    });
  };
  FlightImage.associate = (models) => {
    FlightImage.belongsTo(models.Flight, {
      foreignKey: {
        name: "flightId",
      },
    });
  };

  return FlightImage;
};
