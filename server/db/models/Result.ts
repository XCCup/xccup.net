import { Sequelize, Model, DataTypes, Optional } from "sequelize";

export function initResult(sequelize: Sequelize) {
  const Result = sequelize.define("Result", {
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