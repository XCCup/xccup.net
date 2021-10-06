const Sponsor = require("../config/postgres")["Sponsor"];
const { Op } = require("sequelize");

const { getCurrentYear } = require("../helper/Utils");

const service = {
  getById: async (id) => {
    return Sponsor.findByPk(id);
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
        exclude: [
          "contacts",
          "sponsorInSeasons",
          "createdAt",
          "updatedAt",
          "id",
        ],
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
