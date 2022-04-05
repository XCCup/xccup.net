module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define("Token", {
    token: {
      type: DataTypes.STRING(310),
      allowNull: false,
    },
  });

  return Token;
};
