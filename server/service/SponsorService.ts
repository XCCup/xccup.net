import db from "../db";
import { Op } from "sequelize";
import type {
  SponsorCreationAttributes,
  SponsorInstance,
} from "../db/models/Sponsor";

const { getCurrentYear } = require("../helper/Utils");

const service = {
  getById: async (id: string) => {
    return db.Sponsor.findOne({
      where: { id },
      include: createLogoInclude(),
    });
  },

  getAll: async () => {
    return db.Sponsor.findAll();
  },

  getAllActive: async () => {
    return db.Sponsor.findAll({
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

  create: async (sponsor: SponsorCreationAttributes) => {
    return db.Sponsor.create(sponsor);
  },

  update: async (sponsor: SponsorInstance) => {
    return sponsor.save();
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
