const SeasonDetail = require("../config/postgres")["SeasonDetail"];

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
        year: new Date().getFullYear(),
      },
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

(function init() {
  console.log("Initialize SeasonDetails");
  service.refreshCurrentSeasonDetails();
})();

module.exports = service;
