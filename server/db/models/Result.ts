import { Sequelize, Model, DataTypes, Optional } from "sequelize";

interface ResultAttributes {
  season: number;
  type: string;
  result: object; // TODO: Type this stricter
}

interface ResultInstance extends Model<ResultAttributes>, ResultAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initResult(sequelize: Sequelize) {
  // TODO: No id?
  const Result = sequelize.define<ResultInstance>("Result", {
    season: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING, //newcomer
      allowNull: false,
    },
    result: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  });

  return Result;
}
