import { Sequelize, Model, DataTypes, Optional } from "sequelize";
import { Models } from "../../types/Models";

interface FlightCommentAttributes {
  id: string;
  message: string;
  relatedTo?: string;
}

interface FlightCommentCreationAttributes
  extends Optional<FlightCommentAttributes, "id"> {}

export interface FlightCommentInstance
  extends Model<FlightCommentAttributes, FlightCommentCreationAttributes>,
    FlightCommentAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initFlightComment(
  sequelize: Sequelize
): Models["FlightComment"] {
  const FlightComment = sequelize.define<FlightCommentInstance>(
    "FlightComment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      message: {
        type: DataTypes.STRING(2000),
        allowNull: false,
      },
      relatedTo: {
        type: DataTypes.UUID,
      },
    }
  ) as Models["FlightComment"];

  FlightComment.associate = ({ User }) => {
    FlightComment.belongsTo(User, {
      as: "user",
      foreignKey: {
        name: "userId",
      },
    });
  };

  return FlightComment;
}
