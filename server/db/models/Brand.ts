import { Sequelize, Model, DataTypes, Optional } from "sequelize";
import type { LogoInstance } from "./Logo";

interface BrandAttributes {
  id: string;
  name: string;
  website: string;
}

interface BrandCreationAttributes extends Optional<BrandAttributes, "id"> {}

interface BrandInstance
  extends Model<BrandAttributes, BrandCreationAttributes>,
    BrandAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initBrand(sequelize: Sequelize) {
  const Brand = sequelize.define<BrandInstance>("Brand", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    website: {
      type: DataTypes.STRING,
    },
  });

  Brand.associate = ({ Logo }: { Logo: LogoInstance }) => {
    Brand.hasOne(Logo, {
      as: "logo",
      foreignKey: {
        name: "brandId",
        allowNull: true,
      },
      onDelete: "CASCADE",
      hooks: true,
    });
  };
  return Brand;
}

// FIXME: Was this messed up in the js version?

// Sponsor.associate = (models) => {
//   Sponsor.hasOne(models.Logo, {
//     as: "logo",
//     foreignKey: {
//       name: "brandId",
//       allowNull: true,
//     },
//     onDelete: "CASCADE",
//     hooks: true,
//   });
// };
