const SeasonDetail = require("../db")["SeasonDetail"];
const { getCurrentYear } = require("../helper/Utils");
const logger = require("../config/logger").default;
const { XccupHttpError } = require("../helper/ErrorHandler");
const { getCache, setCache } = require("../controller/CacheManager");

const service = {
  getById: async (id) => {
    return SeasonDetail.findByPk(id);
  },

  getByYear: async (year) => {
    const details = await SeasonDetail.findOne({
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

  getAll: async ({ retrieveOnlyYears } = {}) => {
    return SeasonDetail.findAll({
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
    return SeasonDetail.findOne({
      where: {
        year: getCurrentYear(),
      },
      raw: true,
    });
  },

  create: async (season) => {
    return SeasonDetail.create(season);
  },

  update: async (season) => {
    return SeasonDetail.save(season);
  },

  delete: async (id) => {
    return SeasonDetail.destroy({
      where: { id },
    });
  },
};

module.exports = service;
