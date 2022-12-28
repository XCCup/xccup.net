import db from "../db";
import { getCurrentYear } from "../helper/Utils";
import logger from "../config/logger";
import { XccupHttpError } from "../helper/ErrorHandler";
import { getCache, setCache } from "../controller/CacheManager";
import {
  SeasonDetailInstance,
  SeasonDetailAttributes,
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

  getLatestSeasonDetails: async () => {
    const res = await db.SeasonDetail.findAll({
      order: [["year", "desc"]],
      limit: 1,
      raw: true,
    });
    return res[0];
  },

  create: async (season: SeasonDetailCreationAttributes) => {
    const details = await db.SeasonDetail.findOne({
      where: {
        year: season.year,
      },
    });

    if (details)
      throw new XccupHttpError(
        400,
        `season detail for ${season.year} is already defined`
      );

    return db.SeasonDetail.create(season);
  },

  update: async (id: number, seasonData: SeasonDetailAttributes) => {
    const now = new Date().getTime();
    const start = new Date(seasonData.startDate).getTime();
    const end = new Date(seasonData.endDate).getTime();
    const isActiveSeason = now > start;

    // If season is already ongoing allow update only on these props
    const activeSeasonChangeableProps = {
      isPaused: seasonData.isPaused,
    };

    const updateObject = isActiveSeason
      ? activeSeasonChangeableProps
      : seasonData;

    db.SeasonDetail.update(updateObject, {
      where: {
        id,
      },
    });
  },

  delete: async (id: string) => {
    return db.SeasonDetail.destroy({
      where: { id },
    });
  },
};
export const getCurrentActive = service.getCurrentActive;
module.exports = service;
export default service;
