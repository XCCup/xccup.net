import { Sequelize, Model, DataTypes, Optional } from "sequelize";

export function initToken(sequelize: Sequelize) {
  const Token = sequelize.define("Token", {
    token: {
      type: DataTypes.STRING(310),
      allowNull: false,
    },
  });

  return Token;
}