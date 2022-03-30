const ProfilePicture = require("../config/postgres")["ProfilePicture"];

const { deleteImages, createImageVersions } = require("../helper/ImageUtils");

const service = {
  getByUserId: async (userId) => {
    return ProfilePicture.findOne({
      where: { userId },
    });
  },

  create: async (picture) => {
    await createImageVersions(picture.path);
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
