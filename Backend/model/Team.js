const Team = db.sequelize.define("Team", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  participantInSeasons: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
  },
});