import { Sequelize, Model, DataTypes, Optional } from "sequelize";

export function initFlightPhoto(sequelize: Sequelize) {
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
    isExternalLink: {
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
      as: "user",
      foreignKey: {
        name: "userId",
      },
    });
    FlightPhoto.belongsTo(models.Flight, {
      as: "flight",
      foreignKey: {
        name: "flightId",
      },
    });
  };
  return FlightPhoto;
}
