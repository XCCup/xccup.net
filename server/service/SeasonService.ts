import { SeasonDetailAttributes, SeasonDetailInstance } from "../db/models/SeasonDetail";

import { getCurrentYear } from "../helper/Utils";
import logger from "../config/logger";
import { XccupHttpError } from "../helper/ErrorHandler";
import { getCache, setCache } from "../controller/CacheManager";
import db from "../db";

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

  getAll: async ({ retrieveOnlyYears = true } = {}) => {
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

  finalize: async (results: { name: string, func: CallableFunction }[]) => {
    logger.info("SS: Start to finalize the current season");

    // results.forEach(result => {
    //   Result.create
    // });

  },

  refreshCurrentSeasonDetails: async () => {
    logger.info("SS: Refresh cache for currentSeasonDetails");
    return db.SeasonDetail.findOne({
      where: {
        year: getCurrentYear(),
      },
      raw: true,
    });
  },

  create: async (season: SeasonDetailAttributes) => {
    return db.SeasonDetail.create(season);
  },

  delete: async (id: string) => {
    return db.SeasonDetail.destroy({
      where: { id },
    });
  },
};

export default service;
