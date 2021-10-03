const Sponsor = require("../config/postgres")["Sponsor"];
const { Op } = require("sequelize");

const service = {
  getById: async (id) => {
    return await Sponsor.findByPk(id);
  },

  getAllActive: async () => {
    return await Sponsor.findAll({
      where: {
        sponsorInSeasons: {
          [Op.contains]: [new Date().getFullYear()],
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
