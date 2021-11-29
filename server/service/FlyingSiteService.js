const FlyingSite = require("../config/postgres")["FlyingSite"];
const logger = require("../config/logger");
const { XccupRestrictionError } = require("../helper/ErrorHandler");

const MAX_DIST_TO_SEARCH = 5000;

const siteService = {
  getById: async (id) => {
    return FlyingSite.findByPk(id);
  },

  getByName: async (shortName) => {
    return FlyingSite.findOne({
      where: {
        name: shortName,
      },
    });
  },

  getAllNames: async () => {
    const sites = await FlyingSite.findAll({
      attributes: ["id", "name"],
      order: [["name", "asc"]],
    });
    return sites;
  },

  create: async (site) => {
    return FlyingSite.create(site);
  },

  update: async (site) => {
    return FlyingSite.save(site);
  },

  delete: async (id) => {
    return await FlyingSite.destroy({
      where: { id },
    });
  },

  findClosestTakeoff: async (location) => {
    const query = `
    SELECT
    "id","name","region", ST_Distance(ST_SetSRID(ST_MakePoint(:longitude,:latitude),4326), "point") AS distance
    FROM
    "FlyingSites"
    WHERE
    ST_Distance(ST_SetSRID(ST_MakePoint(:longitude,:latitude),4326), "point") < ${
      MAX_DIST_TO_SEARCH / 95_0000
    }
    ORDER BY 
    distance
    LIMIT 1
    `;

    const takeoffs = await FlyingSite.sequelize.query(query, {
      replacements: {
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        maxDistance: MAX_DIST_TO_SEARCH,
      },
      type: FlyingSite.sequelize.QueryTypes.SELECT,
    });

    if (takeoffs.length == 1) {
      logger.debug("Found takeoff in DB");
      return takeoffs[0];
    } else if (takeoffs.length > 1) {
      const errorMsg = `Found more than one takeoff in DB for lat: ${location.latitude} long: ${location.latitude} within distance of ${MAX_DIST_TO_SEARCH}m`;
      logger.error(errorMsg);
      throw new XccupRestrictionError(errorMsg);
    } else {
      const errorMsg = `Found no takeoff in DB for lat: ${location.latitude} long: ${location.latitude} within distance of ${MAX_DIST_TO_SEARCH}m`;
      logger.error(errorMsg);
      throw new XccupRestrictionError(errorMsg);
    }
  },
};

module.exports = siteService;
