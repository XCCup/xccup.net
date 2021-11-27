module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define("News", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
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
    mailalreadySent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return Token;
};
