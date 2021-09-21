module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define("News", {
    message: {
      type: DataTypes.STRING(5000),
      allowNull: false,
    },
    from: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
    till: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
    sendByMail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    mailAlreadySended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return Token;
};
