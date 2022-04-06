import { Sequelize, Model, DataTypes, Optional } from "sequelize";

interface LogoAttributes {
  id: string;
  path: string;
  // TODO: Are those optionals correct?
  pathThumb?: string;
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
  });

  Logo.associate = (models) => {
    Logo.belongsTo(models.Sponsor, {
      foreignKey: {
        name: "sponsorId",
      },
    });
    Logo.belongsTo(models.Sponsor, {
      foreignKey: {
        name: "brandId",
      },
    });
  };

  return Logo;
}
