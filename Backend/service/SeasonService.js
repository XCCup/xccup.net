const SeasonDetail = require("../config/postgres")["SeasonDetail"];
const { Op } = require("sequelize");

let currentSeasonDetailCache;

const service = {
  getById: async (id) => {
    return await SeasonDetail.findByPk(id);
  },

  getByYear: async (year) => {
    return await SeasonDetail.findOne({
      where: {
        year,
      },
    });
  },

  getAll: async () => {
    return await SeasonDetail.findAll({
      where: {
        active: true,
      },
    });
  },

  getCurrentActive: () => {
    return (currentSeasonDetailCache = currentSeasonDetailCache
      ? currentSeasonDetailCache
      : service.refreshCurrentSeasonDetails());
  },

  refreshCurrentSeasonDetails: async () => {
    console.log("Refresh cache for currentSeasonDetails");
    return (currentSeasonDetailCache = await SeasonDetail.findOne({
      where: {
        active: true,
        year: {
          [Op.lte]: new Date().getFullYear(),
        },
      },
      order: [["year", "DESC"]],
    }));
  },

  create: async (season) => {
    return await SeasonDetail.create(season);
  },

  update: async (season) => {
    return await SeasonDetail.save(season);
  },

  delete: async (id) => {
    return await SeasonDetail.destroy({
      where: { id: id },
    });
  },
};

(function init() {
  console.log("Initialize SeasonDetails");
  service.refreshCurrentSeasonDetails();
})();

module.exports = service;
