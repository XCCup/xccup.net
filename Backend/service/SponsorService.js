const Sponsor = require("../config/postgres")["Sponsor"];
const Logo = require("../config/postgres")["Logo"];
const { Op } = require("sequelize");

const { getCurrentYear } = require("../helper/Utils");

const service = {
  getById: async (id) => {
    return Sponsor.findOne({
      where: { id },
      include: {
        model: Logo,
        attributes: ["id", "path", "pathThumb"],
      },
    });
  },

  getAll: async () => {
    return Sponsor.findAll();
  },

  getAllActive: async () => {
    return Sponsor.findAll({
      where: {
        sponsorInSeasons: {
          [Op.contains]: [getCurrentYear()],
        },
      },
      attributes: {
        exclude: ["contacts", "sponsorInSeasons", "createdAt", "updatedAt"],
      },
      include: {
        model: Logo,
        attributes: ["id"],
      },
    });
  },

  create: async (sponsor) => {
    return Sponsor.create(sponsor);
  },

  update: async (sponsor) => {
    return sponsor.save();
  },

  delete: async (id) => {
    const numberOfDestroyedRows = await Sponsor.destroy({
      where: { id },
    });
    return numberOfDestroyedRows;
  },
};

module.exports = service;
