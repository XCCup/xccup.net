const SeasonDetail = require("../config/postgres")["SeasonDetail"];
const { waitTillDbHasSync, getCurrentYear } = require("../helper/Utils");

let currentSeasonDetailCache;

const service = {
  getById: async (id) => {
    return SeasonDetail.findByPk(id);
  },

  getByYear: async (year) => {
    return SeasonDetail.findOne({
      where: {
        year,
      },
    });
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
    console.log("Refresh cache for currentSeasonDetails");
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
  console.log("Initialize SeasonDetails");
  service.refreshCurrentSeasonDetails();
})();

module.exports = service;
