import { Sequelize, Model, DataTypes, Optional } from "sequelize";
import { Models } from "../../types/Models";

interface ProfilePictureAttributes {
  id: string;
  path: string;
  originalname: string;
  mimetype?: string;
  size?: number;
  userId?: string;
}

export interface ProfilePictureCreationAttributes
  extends Optional<ProfilePictureAttributes, "id"> {}

export interface ProfilePictureInstance
  extends Model<ProfilePictureAttributes, ProfilePictureCreationAttributes>,
    ProfilePictureAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initProfilePicture(
  sequelize: Sequelize
): Models["ProfilePicture"] {
  const ProfilePicture = sequelize.define<ProfilePictureInstance>(
    "ProfilePicture",
    {
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
      mimetype: {
        type: DataTypes.STRING,
      },
      size: {
        type: DataTypes.BIGINT,
      },
    }
  ) as Models["ProfilePicture"];

  ProfilePicture.associate = ({ User }) => {
    ProfilePicture.belongsTo(User, {
      foreignKey: {
        name: "userId",
      },
    });
  };
  return ProfilePicture;
}
