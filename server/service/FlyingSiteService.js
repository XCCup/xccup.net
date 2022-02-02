const FlyingSite = require("../config/postgres")["FlyingSite"];
const logger = require("../config/logger");
const { XccupRestrictionError } = require("../helper/ErrorHandler");
const Club = require("../config/postgres")["Club"];
const User = require("../config/postgres")["User"];

const MAX_DIST_TO_SEARCH = 5000;

const STATES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PROPOSAL: "proposal",
};

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
      where: {
        state: STATES.ACTIVE,
      },
    });
    return sites;
  },

  getAll: async ({ state = STATES.ACTIVE } = {}) => {
    const attributes = [
      "id",
      "name",
      "direction",
      "point",
      "website",
      "createdAt",
      "locationData",
      "heightDifference",
    ];
    if (state == STATES.PROPOSAL) attributes.push("submitter");

    const sites = await FlyingSite.findAll({
      attributes,
      where: {
        state,
      },
      include: {
        model: Club,
        as: "club",
        attributes: ["id", "name"],
      },
    });

    const plainSites = await Promise.all(
      sites.map(async (s) => {
        const plainSite = s.toJSON();
        // Add submitter if it's a proposed site
        if (state == STATES.PROPOSAL) {
          console.log("get user");
          const submitter = await User.findByPk(s.submitter);
          plainSite.submitter = submitter;
        }
        return plainSite;
      })
    );

    return plainSites;
  },

  create: async ({
    name,
    direction,
    long,
    lat,
    clubId,
    website,
    region,
    heightDifference,
    submitter,
  }) => {
    console.log("SUB: ", submitter);

    const site = {
      name,
      direction,
      clubId,
      website,
      region,
      heightDifference,
      state: STATES.PROPOSAL,
      submitter: submitter.id,
      point: {
        type: "Point",
        coordinates: [long, lat],
      },
    };
    return FlyingSite.create(site);
  },

  update: async (site) => {
    return FlyingSite.save(site);
  },

  changeStateToActive: async (site) => {
    site.state = STATES.ACTIVE;
    site.changed("state", true);
    return site.save();
  },

  delete: async (id) => {
    return FlyingSite.destroy({
      where: { id },
    });
  },

  findClosestTakeoff: async (location) => {
    const query = `
    SELECT
    "id","name", ST_DistanceSphere(ST_SetSRID(ST_MakePoint(:longitude,:latitude),4326), "point") AS distance
    FROM
    "FlyingSites"
    WHERE
    ST_DistanceSphere(ST_SetSRID(ST_MakePoint(:longitude,:latitude),4326), "point") < ${MAX_DIST_TO_SEARCH}
    ORDER BY 
    distance
    LIMIT 1
    `;

    const takeoffs = await FlyingSite.sequelize.query(query, {
      replacements: {
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
      },
      type: FlyingSite.sequelize.QueryTypes.SELECT,
    });

    if (takeoffs.length == 1) {
      logger.debug("Found takeoff in DB");
      return takeoffs[0];
    } else if (takeoffs.length > 1) {
      const errorMsg = `Found more than one takeoff in DB for lat: ${location.latitude} long: ${location.longitude} within distance of ${MAX_DIST_TO_SEARCH}m`;
      throw new XccupRestrictionError(errorMsg);
    } else {
      const errorMsg = `Found no takeoff in DB for lat: ${location.latitude} long: ${location.longitude} within distance of ${MAX_DIST_TO_SEARCH}m`;
      throw new XccupRestrictionError(errorMsg);
    }
  },
};

module.exports = siteService;
