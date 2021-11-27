const Logo = require("../config/postgres")["Logo"];

const { deleteImages, createThumbnail } = require("../helper/ImageUtils");

const THUMBNAIL_IMAGE_HEIGHT = 50;

const service = {
  getById: async (id) => {
    return Logo.findByPk(id);
  },

  getAll: async () => {
    return Logo.findAll();
  },

  create: async (logo) => {
    const pathThumb = createThumbnail(logo.path, THUMBNAIL_IMAGE_HEIGHT);
    return Logo.create({ ...logo, pathThumb });
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
