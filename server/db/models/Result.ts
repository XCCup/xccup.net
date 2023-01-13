import { Sequelize, Model, DataTypes } from "sequelize";
import { Models } from "../../types/Models";

interface ResultAttributes {
  season: number;
  type: string;
  result: object[];
}

export interface ResultInstance
  extends Model<ResultAttributes>,
    ResultAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initResult(sequelize: Sequelize): Models["Result"] {
  const Result = sequelize.define<ResultInstance>("Result", {
    season: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING, //e.g. newcomer
      allowNull: false,
    },
    result: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  });

  return Result;
}
