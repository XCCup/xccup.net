const { Club, User } = require("../model/DependentModels");
const { Op } = require("sequelize");

const clubService = {
  getAllActive: async () => {
    return await Club.findAll({
      where: {
        participantInSeasons: {
          [Op.contains]: [new Date().getFullYear()],
        },
      },
      attributes: { exclude: ["contacts"] },
    });
  },
  getAll: async () => {
    return await Club.findAll();
  },

  getById: async (id) => {
    return await Club.findByPk(id);
  },

  getByShortName: async (shortName) => {
    return await Club.findOne({
      where: { shortName },
    });
  },

  getAllMemberOfClub: async (shortName) => {
    return await User.findAll({
      attributes: [
        "name",
        "firstName",
        "lastName",
        "urlProfilPicture",
        "gender",
        "gliders",
        "emailTeamSearch",
        "state",
      ],
      include: {
        model: Club,
        attributes: ["name", "shortName"],
        as: "Club",
        where: {
          shortName,
        },
      },
    });
  },

  create: async (club) => {
    return await Club.create(club);
  },

  update: async (club) => {
    return await club.save();
  },

  delete: async (id) => {
    const numberOfDestroyedRows = await Club.destroy({
      where: { id },
    });
    return numberOfDestroyedRows;
  },
};

module.exports = clubService;
