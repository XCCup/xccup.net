import db from "../db";
import { ClubInstance } from "../db/models/Club";
import { SponsorInstance } from "../db/models/Sponsor";
import type { LogoAttributes, LogoInstance } from "../db/models/Logo";
import { deleteImages, createImageVersions } from "../helper/ImageUtils";
import { Op } from "sequelize";

const service = {
  getById: async (id: string) => {
    return db.Logo.findByPk(id);
  },

  create: async (logo: LogoAttributes) => {
    await createImageVersions(logo.path);
    return db.Logo.create(logo);
  },

  update: async (logo: LogoInstance) => {
    return logo.save();
  },

  deleteOldLogo: async (reference: ClubInstance | SponsorInstance) => {
    db.Logo.destroy({
      where: {
        //@ts-ignore
        [Op.or]: [{ sponsorId: reference.id }, { clubId: reference.id }],
      },
    });
    // @ts-ignore
    deleteImages(reference.logo);
  },
};

module.exports = service;
