import db from "../db";
import logger from "../config/logger";
import { XccupRestrictionError } from "../helper/ErrorHandler";
import { getElevationData, logElevationError } from "../igc/ElevationHelper";
import { QueryTypes } from "sequelize";
import {
  FlyingSiteCreationAttributes,
  FlyingSiteInstance,
  FlyingSiteState,
} from "../db/models/FlyingSite";
import { BRecord } from "../helper/igc-parser";

const MAX_DIST_TO_SEARCH = 5000;

const STATES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PROPOSAL: "proposal",
} as const;

interface NewSite {
  name: string;
  direction: string;
  long: number;
  lat: number;
  clubId: string;
  website: string;
  region: string;
  heightDifference: number;
  submitter: string;
}

const siteService = {
  getById: async (id: string) => {
    return db.FlyingSite.findByPk(id);
  },

  getByName: async (shortName: string) => {
    return db.FlyingSite.findOne({
      where: {
        name: shortName,
      },
    });
  },

  getAllNames: async () => {
    const sites = await db.FlyingSite.findAll({
      attributes: ["id", "name"],
      order: [["name", "asc"]],
      where: {
        state: STATES.ACTIVE,
      },
    });
    return sites;
  },

  getAll: async ({
    state = STATES.ACTIVE,
  }: { state?: FlyingSiteState } = {}) => {
    const attributes = [
      "id",
      "name",
      "direction",
      "point",
      "website",
      "createdAt",
      "locationData",
      "heightDifference",
      "elevation",
    ];
    if (state == STATES.PROPOSAL) attributes.push("submitter");

    const sites = await db.FlyingSite.findAll({
      attributes,
      where: {
        state,
      },
      include: {
        model: db.Club,
        as: "club",
        attributes: ["id", "name"],
      },
    });

    const plainSites = await Promise.all(
      sites.map(async (s) => {
        const plainSite = s.toJSON();
        // Add submitter if it's a proposed site
        if (state == STATES.PROPOSAL) {
          const submitter = await db.User.findByPk(s.submitter);
          // @ts-ignore We add more info about the submitting user here regardless of types
          plainSite.submitter = { id: submitter?.id, email: submitter.email };
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
  }: NewSite) => {
    let elevation = 0;
    const location = [{ latitude: lat, longitude: long }];
    try {
      const res = await getElevationData(location);
      elevation = res[0];
    } catch (error) {
      logElevationError(error);
    }

    const site: FlyingSiteCreationAttributes = {
      name,
      direction,
      clubId,
      website,
      locationData: {
        region,
      },
      heightDifference,
      elevation,
      state: STATES.PROPOSAL,
      submitter,
      point: {
        type: "Point",
        coordinates: [long, lat],
      },
    };
    return db.FlyingSite.create(site);
  },

  update: async (site: FlyingSiteInstance) => {
    return site.save();
  },

  changeStateToActive: async (site: FlyingSiteInstance) => {
    site.state = STATES.ACTIVE;
    site.changed("state", true);
    return site.save();
  },

  delete: async (id: string) => {
    return db.FlyingSite.destroy({
      where: { id },
    });
  },

  findClosestTakeoff: async (location: BRecord) => {
    const query = `
    SELECT
    "id","name", "elevation", ST_DistanceSphere(ST_SetSRID(ST_MakePoint(:longitude,:latitude),4326), "point") AS distance
    FROM
    "FlyingSites"
    WHERE
    ST_DistanceSphere(ST_SetSRID(ST_MakePoint(:longitude,:latitude),4326), "point") < ${MAX_DIST_TO_SEARCH}
    AND
    "state" = 'active'
    ORDER BY 
    distance
    LIMIT 1
    `;

    const takeoffs = await db.FlyingSite.sequelize?.query(query, {
      replacements: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      type: QueryTypes.SELECT,
    });

    if (!takeoffs || takeoffs.length == 0) {
      const errorMsg = `Found no takeoff in DB for lat: ${location.latitude} long: ${location.longitude} within distance of ${MAX_DIST_TO_SEARCH}m`;
      throw new XccupRestrictionError(errorMsg);
    }

    if (takeoffs.length == 1) {
      logger.debug("Found takeoff in DB");
      return takeoffs[0];
    } else if (takeoffs.length > 1) {
      const errorMsg = `Found more than one takeoff in DB for lat: ${location.latitude} long: ${location.longitude} within distance of ${MAX_DIST_TO_SEARCH}m`;
      throw new XccupRestrictionError(errorMsg);
    }
  },
};

module.exports = siteService;
