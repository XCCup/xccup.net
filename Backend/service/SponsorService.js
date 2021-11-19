const Sponsor = require("../config/postgres")["Sponsor"];
const Logo = require("../config/postgres")["Logo"];
const { Op } = require("sequelize");

const { getCurrentYear } = require("../helper/Utils");

const service = {
  getById: async (id) => {
    return Sponsor.findOne({
      where: { id },
      include: createLogoInclude(),
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
        exclude: ["sponsorInSeasons", "contacts", "createdAt", "updatedAt"],
      },
      include: createLogoInclude(),
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

function createLogoInclude() {
  return {
    model: Logo,
    as: "logo",
    attributes: ["id", "path", "pathThumb"],
  };
}

module.exports = service;
