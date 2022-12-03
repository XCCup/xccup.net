import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  BelongsToCreateAssociationMixin,
} from "sequelize";
import { Models } from "../../types/Models";
import { FlightInstance } from "./Flight";
import { UserInstance } from "./User";

export interface FlightCommentInstance
  extends Model<
    InferAttributes<FlightCommentInstance>,
    InferCreationAttributes<FlightCommentInstance>
  > {
  id: CreationOptional<number>;
  message: string;
  relatedTo?: string;
  userId: BelongsToCreateAssociationMixin<UserInstance>;
  flightId: BelongsToCreateAssociationMixin<FlightInstance>;
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

  FlightComment.associate = ({ User, Flight }) => {
    FlightComment.belongsTo(User, {
      as: "user",
      foreignKey: {
        name: "userId",
      },
    });
    FlightComment.belongsTo(Flight, {
      as: "comment",
      foreignKey: {
        name: "flightId",
      },
    });
  };

  return FlightComment;
}
