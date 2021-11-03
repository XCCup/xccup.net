const SeasonDetail = require("../config/postgres")["SeasonDetail"];
const { waitTillDbHasSync, getCurrentYear } = require("../helper/Utils");
const logger = require("../config/logger");
const { XccupRestrictionError } = require("../helper/ErrorHandler");

let currentSeasonDetailCache;

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
      throw new XccupRestrictionError(
        `There is no valid configuration for the requested year of ${year}`
      );

    return details;
  },

  getAll: async () => {
    return SeasonDetail.findAll();
  },

  getCurrentActive: () => {
    return (currentSeasonDetailCache = currentSeasonDetailCache
      ? currentSeasonDetailCache
      : service.refreshCurrentSeasonDetails());
  },

  refreshCurrentSeasonDetails: async () => {
    logger.info("Refresh cache for currentSeasonDetails");
    return (currentSeasonDetailCache = SeasonDetail.findOne({
      where: {
        year: getCurrentYear(),
      },
      raw: true,
    }));
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

(async function init() {
  await waitTillDbHasSync();
  logger.info("Initialize SeasonDetails");
  service.refreshCurrentSeasonDetails();
})();

module.exports = service;
