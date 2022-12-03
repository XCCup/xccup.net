import db from "../db";
import {
  ProfilePictureInstance,
  ProfilePictureCreationAttributes,
} from "../db/models/ProfilePicture";
import { deleteImages, createImageVersions } from "../helper/ImageUtils";

const service = {
  getById: async (id: string) => {
    return db.ProfilePicture.findByPk(id);
  },

  getByUserId: async (userId: string) => {
    return db.ProfilePicture.findOne({
      where: { userId },
    });
  },

  create: async (picture: ProfilePictureCreationAttributes) => {
    await createImageVersions(picture.path, { forceJpeg: true });
    return db.ProfilePicture.create(picture);
  },

  update: async (picture: ProfilePictureInstance) => {
    return picture.save();
  },

  delete: async (picture: ProfilePictureInstance) => {
    deleteImages(picture);
    picture.destroy();
  },
};

module.exports = service;
