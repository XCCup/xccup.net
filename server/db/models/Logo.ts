import { Sequelize, Model, DataTypes, Optional } from "sequelize";
import { Models } from "../../types/Models";

interface LogoAttributes {
  id: string;
  path: string;
  originalname?: string;
  mimetype?: string;
  size?: number;
}

interface LogoCreationAttributes extends Optional<LogoAttributes, "id"> {}

export interface LogoInstance
  extends Model<LogoAttributes, LogoCreationAttributes>,
    LogoAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initLogo(sequelize: Sequelize): Models["Logo"] {
  const Logo = sequelize.define<LogoInstance>("Logo", {
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
    },
    mimetype: {
      type: DataTypes.STRING,
    },
    size: {
      type: DataTypes.BIGINT,
    },
  }) as Models["Logo"];

  Logo.associate = ({ Sponsor }) => {
    Logo.belongsTo(Sponsor, {
      foreignKey: {
        name: "sponsorId",
      },
    });
    Logo.belongsTo(Sponsor, {
      foreignKey: {
        name: "brandId",
      },
    });
  };

  return Logo;
}
