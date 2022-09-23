import db from "../db";
import { Op } from "sequelize";
import type { SponsorCreationAttributes } from "../db/models/Sponsor";

const { getCurrentYear } = require("../helper/Utils");

const service = {
  getById: async (id: string) => {
    return db.Sponsor.findOne({
      where: { id },
      include: createLogoInclude(),
    });
  },

  getAll: async () => {
    return db.Sponsor.findAll({
      include: createLogoInclude(),
    });
  },

  getAllActive: async () => {
    return db.Sponsor.findAll({
      where: {
        sponsorInSeasons: {
          [Op.contains]: [getCurrentYear()],
        },
      },
      attributes: {
        exclude: ["sponsorInSeasons", "contact", "createdAt", "updatedAt"],
      },
      include: createLogoInclude(),
    });
  },

  create: async (sponsor: SponsorCreationAttributes) => {
    return db.Sponsor.create(sponsor);
  },

  update: async (sponsor: SponsorCreationAttributes) => {
    return db.Sponsor.update(sponsor, {
      where: {
        id: sponsor.id,
      },
    });
  },

  delete: async (id: string) => {
    const numberOfDestroyedRows = await db.Sponsor.destroy({
      where: { id },
    });
    return numberOfDestroyedRows;
  },
};

function createLogoInclude() {
  return {
    model: db.Logo,
    as: "logo",
    attributes: ["id", "path"],
  };
}

module.exports = service;
