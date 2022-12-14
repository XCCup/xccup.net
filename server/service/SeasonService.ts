import db from "../db";
import { getCurrentYear } from "../helper/Utils";
import logger from "../config/logger";
import { XccupHttpError } from "../helper/ErrorHandler";
import { getCache, setCache } from "../controller/CacheManager";
import {
  SeasonDetailInstance,
  SeasonDetailCreationAttributes,
} from "../db/models/SeasonDetail";

const service = {
  getById: async (id: string) => {
    return db.SeasonDetail.findByPk(id);
  },

  getByYear: async (year: number) => {
    const details = await db.SeasonDetail.findOne({
      where: {
        year,
      },
    });

    if (!details)
      throw new XccupHttpError(
        422,
        `There is no valid configuration for the requested year of ${year}`
      );

    return details;
  },

  getAll: async ({ retrieveOnlyYears } = { retrieveOnlyYears: false }) => {
    return db.SeasonDetail.findAll({
      attributes: retrieveOnlyYears ? ["year"] : undefined,
    });
  },

  getCurrentActive: async () => {
    const cacheKey = { originalUrl: "currentSeasonDetails" };

    const cachedDetails = getCache(cacheKey);

    if (cachedDetails) return cachedDetails;

    const currentSeasonDetails = await service.refreshCurrentSeasonDetails();
    setCache(cacheKey, currentSeasonDetails);

    return currentSeasonDetails;
  },

  refreshCurrentSeasonDetails: async () => {
    logger.info("Refresh cache for currentSeasonDetails");
    return db.SeasonDetail.findOne({
      where: {
        year: getCurrentYear(),
      },
      raw: true,
    });
  },

  create: async (season: SeasonDetailCreationAttributes) => {
    return db.SeasonDetail.create(season);
  },

  update: async (season: SeasonDetailInstance) => {
    return season.save();
  },

  delete: async (id: string) => {
    return db.SeasonDetail.destroy({
      where: { id },
    });
  },
};
export const getCurrentActive = service.getCurrentActive;
module.exports = service;
