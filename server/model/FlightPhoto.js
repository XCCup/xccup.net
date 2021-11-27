module.exports = (sequelize, DataTypes) => {
  const FlightPhoto = sequelize.define("FlightPhoto", {
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

  FlightPhoto.associate = (models) => {
    FlightPhoto.belongsTo(models.User, {
      as: "photos",
      foreignKey: {
        name: "userId",
      },
    });
  };
  FlightPhoto.associate = (models) => {
    FlightPhoto.belongsTo(models.Flight, {
      as: "photos",
      foreignKey: {
        name: "flightId",
      },
    });
  };

  return FlightPhoto;
};
