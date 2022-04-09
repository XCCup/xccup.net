import { Sequelize, Model, DataTypes, Optional, ModelStatic } from "sequelize";

import type { UserInstance } from "./User";
interface ProfilePictureAttributes {
  id: string;
  path: string;
  pathThumb?: string; // TODO: This is unused! Remove it?
  originalname: string;
  mimetype?: string;
  size?: number;
}

interface ProfilePictureCreationAttributes
  extends Optional<ProfilePictureAttributes, "id"> {}

export interface ProfilePictureInstance
  extends Model<ProfilePictureAttributes, ProfilePictureCreationAttributes>,
    ProfilePictureAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}
interface ProfilePicture extends ModelStatic<ProfilePictureInstance> {
  associate: (props: { User: ModelStatic<UserInstance> }) => void;
}
export function initProfilePicture(sequelize: Sequelize) {
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
      pathThumb: {
        type: DataTypes.STRING,
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
  ) as ProfilePicture;

  ProfilePicture.associate = ({ User }) => {
    ProfilePicture.belongsTo(User, {
      foreignKey: {
        name: "userId",
      },
    });
  };
  return ProfilePicture;
}
