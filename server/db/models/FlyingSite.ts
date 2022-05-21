import { Sequelize, Model, DataTypes, Optional } from "sequelize";
import { Models } from "../../types/Models";

interface FlyingSiteAttributes {
  id: string;
  locationData?: object; // TODO: Type this stricter
  name: string;
  shortName?: string;
  direction: string;
  point: DataTypes.GeometryDataType;
  type?: string;
  image?: string;
  heightDifference?: number;
  elevation: number;
  state?: "active" | "inactive" | "proposal";
  website?: string;
  submitter?: string;
}

interface FlyingSiteCreationAttributes
  extends Optional<FlyingSiteAttributes, "id"> {}

export interface FlyingSiteInstance
  extends Model<FlyingSiteAttributes, FlyingSiteCreationAttributes>,
    FlyingSiteAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initFlyingSite(sequelize: Sequelize): Models["FlyingSite"] {
  const FlyingSite = sequelize.define<FlyingSiteInstance>("FlyingSite", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    locationData: {
      type: DataTypes.JSON,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    shortName: {
      type: DataTypes.STRING,
      unique: true,
    },
    direction: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    point: {
      type: DataTypes.GEOMETRY("POINT", 4326),
      allowNull: false,
      /*
          We will use GEOMETRY on purpose. GEOGRAPHY would be more accurate, but also much slower.
      */
    },
    type: {
      type: DataTypes.STRING,
    },
    image: {
      type: DataTypes.STRING,
    },
    heightDifference: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    elevation: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    state: {
      type: DataTypes.STRING,
      defaultValue: "active",
    },
    website: {
      type: DataTypes.STRING,
    },
    submitter: {
      type: DataTypes.UUID,
    },
  }) as Models["FlyingSite"];

  FlyingSite.associate = ({ Flight, Club }) => {
    FlyingSite.hasMany(Flight, {
      as: "flights",
      foreignKey: {
        name: "siteId",
      },
    });

    FlyingSite.belongsTo(Club, {
      as: "club",
      foreignKey: {
        name: "clubId",
      },
    });
  };
  return FlyingSite;
}
