import { Sequelize, Model, DataTypes } from "sequelize";
import { Models } from "../../types/Models";

interface TokenAttributes {
  token: string;
}

export interface TokenInstance extends Model<TokenAttributes>, TokenAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initToken(sequelize: Sequelize): Models["Token"] {
  const Token = sequelize.define<TokenInstance>("Token", {
    token: {
      type: DataTypes.STRING(310),
      allowNull: false,
    },
  });

  return Token;
}
