const ProfilePicture = require("../config/postgres")["ProfilePicture"];

const { deleteImages, createThumbnail } = require("../helper/ImageUtils");

const THUMBNAIL_IMAGE_HEIGHT = 100;

const service = {
  getByUserId: async (userId) => {
    return ProfilePicture.findOne({
      where: { userId },
    });
  },

  create: async (picture) => {
    const pathThumb = createThumbnail(picture.path, THUMBNAIL_IMAGE_HEIGHT);
    return ProfilePicture.create({ ...picture, pathThumb });
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
