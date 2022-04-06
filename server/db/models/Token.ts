import { Sequelize, Model, DataTypes, Optional } from "sequelize";

interface TokenAttributes {
  token: string;
}

interface TokenInstance extends Model<TokenAttributes>, TokenAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initToken(sequelize: Sequelize) {
  const Token = sequelize.define<TokenInstance>("Token", {
    token: {
      type: DataTypes.STRING(310),
      allowNull: false,
    },
  });

  return Token;
}
