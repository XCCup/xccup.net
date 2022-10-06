const Club = require("../db")["Club"];
const User = require("../db")["User"];
const Logo = require("../db")["Logo"];
const { Op } = require("sequelize");

const { getCurrentYear } = require("../helper/Utils");

const clubService = {
  getAllActive: async () => {
    return Club.findAll({
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
    return Club.findAll({
      where: {
        participantInSeasons: {
          [Op.contains]: [getCurrentYear()],
        },
      },
      attributes: ["id", "name"],
      order: [["name", "asc"]],
    });
  },
  getAll: async () => {
    return Club.findAll();
  },

  getById: async (id) => {
    return Club.findByPk(id, {
      include: createLogoInclude(),
    });
  },

  getByShortName: async (shortName) => {
    return Club.findOne({
      where: { shortName },
    });
  },

  getAllMemberOfClub: async (shortName) => {
    return User.findAll({
      attributes: [
        "name",
        "firstName",
        "lastName",
        "fullName",
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

  countActive: async () => {
    return Club.count({
      where: {
        participantInSeasons: {
          [Op.contains]: [getCurrentYear()],
        },
      },
    });
  },

  create: async (club) => {
    return Club.create(club);
  },

  update: async (club) => {
    return club.save();
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
    attributes: ["id", "path"],
  };
}

module.exports = clubService;
