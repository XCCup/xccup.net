import { Sequelize, Model, DataTypes, Optional } from "sequelize";

interface FlightCommentAttributes {
  id: string;
  message: string;
  relatedTo?: string;
}

interface FlightCommentCreationAttributes
  extends Optional<FlightCommentAttributes, "id"> {}

interface FlightCommentInstance
  extends Model<FlightCommentAttributes, FlightCommentCreationAttributes>,
    FlightCommentAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initFlightComment(sequelize: Sequelize) {
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
  );

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
