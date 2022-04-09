import { Sequelize, Model, DataTypes, Optional, ModelStatic } from "sequelize";
import { Models } from "../../types/Models";

interface BrandAttributes {
  id: string;
  name: string;
  website: string;
}

interface BrandCreationAttributes extends Optional<BrandAttributes, "id"> {}

export interface BrandInstance
  extends Model<BrandAttributes, BrandCreationAttributes>,
    BrandAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initBrand(sequelize: Sequelize): Models["Brand"] {
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
  }) as Models["Brand"];

  Brand.associate = ({ Logo }) => {
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
