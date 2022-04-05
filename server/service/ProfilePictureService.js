const ProfilePicture = require("../db")["ProfilePicture"];

const { deleteImages, createImageVersions } = require("../helper/ImageUtils");

const service = {
  getByUserId: async (userId) => {
    return ProfilePicture.findOne({
      where: { userId },
    });
  },

  create: async (picture) => {
    await createImageVersions(picture.path, { forceJpeg: true });
    return ProfilePicture.create(picture);
  },

  update: async (picture) => {
    return picture.save();
  },

  delete: async (picture) => {
    deleteImages(picture);
    picture.destroy();
  },
};

module.exports = service;
