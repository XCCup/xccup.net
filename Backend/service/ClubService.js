const Club = require("../config/postgres")["Club"];
const User = require("../config/postgres")["User"];
const { Op } = require("sequelize");
const cacheManager = require("./CacheManager");

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

  count: async () => {
    return Club.count();
  },

  create: async (club) => {
    cacheManager.invalidateCaches();
    return await Club.create(club);
  },

  update: async (club) => {
    cacheManager.invalidateCaches();
    return await club.save();
  },

  delete: async (id) => {
    cacheManager.invalidateCaches();
    const numberOfDestroyedRows = await Club.destroy({
      where: { id },
    });
    return numberOfDestroyedRows;
  },
};

module.exports = clubService;
