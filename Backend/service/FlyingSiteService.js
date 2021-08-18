const { FlyingSite } = require("../model/DependentModels");

const siteService = {
  getById: async (id) => {
    return await FlyingSite.findByPk(id);
  },

  getByName: async (name) => {
    return await FlyingSite.findOne({
      where: {
        name: name,
      },
    });
  },

  create: async (season) => {
    return await FlyingSite.create(season);
  },

  update: async (season) => {
    return await FlyingSite.save(season);
  },

  delete: async (id) => {
    return await FlyingSite.destroy({
      where: { id: id },
    });
  },

  findClosestTakeoff: async (location) => {
    const maxDistanceToSearch = 0;
    const query = `
    SELECT
    "description", ST_Distance(ST_SetSRID(ST_MakePoint(:latitude, :longitude),4326), "point") AS distance
    FROM
    "FlyingSites"
    WHERE
    ST_Distance(ST_SetSRID(ST_MakePoint(:latitude, :longitude),4326), "point") < :maxDistance
    ORDER BY 
    distance
    LIMIT 1
    `;

    const takeoffs = await FlyingSite.sequelize.query(query, {
      replacements: {
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        maxDistance: maxDistanceToSearch,
      },
      type: FlyingSite.sequelize.QueryTypes.SELECT,
    });

    if (takeoffs.length == 1) {
      console.log("Found takeoff in DB");
      return takeoffs[0].description;
    } else if (takeoffs.length > 1) {
      const errorMsg = `Found more than one takeoff in DB for location ${location} within distance of ${maxDistanceToSearch}m`;
      console.log(errorMsg);
      return errorMsg;
    } else {
      const errorMsg = `Found no takeoff in DB within distance of ${maxDistanceToSearch}m`;
      console.log(errorMsg);
      return errorMsg;
    }
  },
};

module.exports = siteService;
