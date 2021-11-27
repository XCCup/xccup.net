const Club = require("../config/postgres")["Club"];
const User = require("../config/postgres")["User"];
const Logo = require("../config/postgres")["Logo"];
const { Op } = require("sequelize");

const { getCurrentYear } = require("../helper/Utils");

const clubService = {
  getAllActive: async () => {
    return await Club.findAll({
      where: {
        participantInSeasons: {
          [Op.contains]: [getCurrentYear()],
        },
      },
      include: createLogoInclude(),
      attributes: { exclude: ["contacts"] },
    });
  },
  getAllNames: async () => {
    const clubs = await Club.findAll({
      where: {
        participantInSeasons: {
          [Op.contains]: [getCurrentYear()],
        },
      },
      attributes: ["id", "name"],
      order: [["name", "asc"]],
    });
    return clubs;
  },
  getAll: async () => {
    return await Club.findAll();
  },

  getById: async (id) => {
    return await Club.findByPk(id, {
      include: createLogoInclude(),
    });
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

function createLogoInclude() {
  return {
    model: Logo,
    as: "logo",
    attributes: ["id", "path", "pathThumb"],
  };
}

module.exports = clubService;
