const Logo = require("../config/postgres")["Logo"];

const { deleteImages, createSmallerSizes } = require("../helper/ImageUtils");

const service = {
  getById: async (id) => {
    return Logo.findByPk(id);
  },

  getAll: async () => {
    return Logo.findAll();
  },

  create: async (logo) => {
    await createSmallerSizes(logo.path);
    return Logo.create(logo);
  },

  update: async (logo) => {
    return logo.save();
  },

  deleteOldLogo: async (sponsor) => {
    Logo.destroy({
      where: {
        sponsorId: sponsor.id,
      },
    });
    deleteImages(sponsor.Logo);
  },
};

module.exports = service;
