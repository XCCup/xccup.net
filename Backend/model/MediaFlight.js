module.exports = (sequelize, DataTypes) => {
  const MediaFlight = sequelize.define("MediaFlight", {
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

  MediaFlight.associate = (models) => {
    MediaFlight.belongsTo(models.User, {
      foreignKey: {
        name: "userId",
      },
    });
  };
  MediaFlight.associate = (models) => {
    MediaFlight.belongsTo(models.Flight, {
      foreignKey: {
        name: "flightId",
      },
    });
  };

  return MediaFlight;
};
