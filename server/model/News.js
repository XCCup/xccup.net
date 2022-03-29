module.exports = (sequelize, DataTypes) => {
  const News = sequelize.define("News", {
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
    icon: {
      type: DataTypes.STRING,
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
    // This column should support features like links
    // e.g.:
    // meta : {
    //   links: [
    //     {
    //       title: "title",
    //       value: "/flug/9",
    //       internal: true
    //     }
    //   ]
    // }
    meta: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  });

  return News;
};
