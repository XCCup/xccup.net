import { Sequelize, Model, DataTypes, Optional, ModelStatic } from "sequelize";

import type { SponsorInstance } from "./Sponsor";

interface LogoAttributes {
  id: string;
  path: string;
  pathThumb?: string; // TODO: This is unused! Remove it?
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

interface Logo extends ModelStatic<LogoInstance> {
  associate: (props: { Sponsor: ModelStatic<SponsorInstance> }) => void;
}

export function initLogo(sequelize: Sequelize) {
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
    // TODO: This is unused! Remove it?
    pathThumb: {
      type: DataTypes.STRING,
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
  }) as Logo;

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
