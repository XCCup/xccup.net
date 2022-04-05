const Logo = require("../db")["Logo"];

const { deleteImages, createImageVersions } = require("../helper/ImageUtils");

const service = {
  getById: async (id) => {
    return Logo.findByPk(id);
  },

  getAll: async () => {
    return Logo.findAll();
  },

  create: async (logo) => {
    await createImageVersions(logo.path);
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
