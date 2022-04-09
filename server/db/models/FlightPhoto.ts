import { Sequelize, Model, DataTypes, Optional } from "sequelize";
import { Models } from "../../types/Models";

interface FlightPhotoAttributes {
  id: string;
  path: string;
  pathThumb?: string;
  originalname?: string;
  description?: string;
  timestamp?: string; // TODO: Is this correct?
  mimetype?: string;
  size?: number;
  isExternalLink?: boolean;
  likers?: string[];
}

interface FlightPhotoCreationAttributes
  extends Optional<FlightPhotoAttributes, "id"> {}

export interface FlightPhotoInstance
  extends Model<FlightPhotoAttributes, FlightPhotoCreationAttributes>,
    FlightPhotoAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initFlightPhoto(sequelize: Sequelize): Models["FlightPhoto"] {
  const FlightPhoto = sequelize.define<FlightPhotoInstance>("FlightPhoto", {
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
  }) as Models["FlightPhoto"];

  FlightPhoto.associate = ({ User, Flight }) => {
    FlightPhoto.belongsTo(User, {
      as: "user",
      foreignKey: {
        name: "userId",
      },
    });
    FlightPhoto.belongsTo(Flight, {
      as: "flight",
      foreignKey: {
        name: "flightId",
      },
    });
  };
  return FlightPhoto;
}
