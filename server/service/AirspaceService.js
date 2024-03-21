const FlightFixes = require("../db")["FlightFixes"];
const Airspace = require("../db")["Airspace"];
const { Op } = require("sequelize");
const logger = require("../config/logger");
const { combineFixesProperties } = require("../helper/FlightFixUtils");
const { XccupRestrictionError } = require("../helper/ErrorHandler");
const {
  convertVerticalLimitToMeterMSL,
} = require("../helper/AirspaceHeightConverter");

const FEET_IN_METER = 0.3048;

const service = {
  getById: async (id) => {
    return Airspace.findByPk(id);
  },

  getByName: async (name) => {
    return Airspace.findOne({
      where: {
        name,
      },
    });
  },

  getAllRelevant: (year, points) => {
    // We don't have any airspace data prior 2022.
    // Therefore we retrieve always data from 2022 if old airspaces are requested.
    // If year is undefined we retrieve the current year.
    const adjustedYear =
      year == undefined ? new Date().getFullYear() : year < 2022 ? 2022 : year;

    return findAirspacesWithinPolygon(adjustedYear, points);
  },

  addAirspace: async (airspace) => {
    logger.info("Will upload new airspace to db");

    const results = await findMatchingAirspaces(airspace);

    checkIfOnlyOneEntryWasFound(results, airspace);

    if (results.length == 1) {
      logger.info(
        "AS: Will add new season to already present airspace " + airspace.name
      );
      const entry = results[0];
      checkIfEntryForSeasonAlreadyExists(entry, airspace);
      await addNewSeasonToDbEntry(entry, airspace);
      return "add new season";
    }

    logger.info("AS: Will create new airspace entry for " + airspace.name);
    await Airspace.create(airspace);
    return "create new entry";
  },

  /**
   * It was encountered that some entries in the DB are not valid by means of OpenGIS specification.
   * You will maybe see an error like "lwgeom_intersection_prec: GEOS Error: TopologyException: Input geom 0 is invalid: Self-intersection at or near point".
   *
   * You can list all invalid ones with "SELECT * from "Airspaces" WHERE NOT ST_isvalid(polygon);".
   *
   * And you can fix these with "UPDATE "Airspaces" SET polygon = ST_MakeValid(polygon) WHERE NOT ST_IsValid(polygon);""
   * See also: https://www.sigterritoires.fr/index.php/en/how-to-rectify-the-geometry-of-a-postgis-table/
   *
   */
  fixInvalidGeoData: async () => {
    const query = `
    UPDATE "Airspaces" SET polygon = ST_MakeValid(polygon) WHERE NOT ST_IsValid(polygon);
    `;

    return FlightFixes.sequelize.query(query, {
      type: FlightFixes.sequelize.QueryTypes.UPDATE,
    });
  },

  /**
   * Checks for any airspace violation of the given flight track.
   * This is done in 3 steps.
   * 1. Check if any fix of the track exceeds the general altitude limitation of FL100
   * 2. Check within PostGIS if the flight track intersects with any airspace polygon in the 2D plain.
   * 3. Check for every found intersection if any of these points is within the vertical (3D) boundaries of the intersecting airspace.
   *
   * We will use the GPS data of a track. This is not 100% corrected (especially when checking against FL).
   * But some trackers don't offer baro data and we don't want to give any advantages to particular tracker setups.
   *
   * Because some airspace boundaries are defined in relation to the surface (e.g. 2000 ft AGL) it's necessary that the data of the flight track also contains the related elevation data.
   *
   * @param {object} fixesWithElevation The fixes of a flight track attached with there corresponding elevation data.
   * @returns A airspaceViolation object with lat,long, elevation data of the first fix with a airspace violation and also a line of the whole flighttrack.
   */
  hasAirspaceViolation: async (fixesWithElevation) => {
    const startTime = new Date();

    const flightTrackLine = combineFixesProperties(fixesWithElevation);

    const airspaceViolations = [];

    findViolationOfFL100(flightTrackLine, airspaceViolations);

    const intersections2D = await findHorizontalIntersection(
      fixesWithElevation.id
    );

    for (let rI = 0; rI < intersections2D.length; rI++) {
      const intersection = intersections2D[rI];

      for (
        let cI = 0;
        cI < intersection.intersectionLine.coordinates.length;
        cI++
      ) {
        const coordinate = intersection.intersectionLine.coordinates[cI];

        findVerticalIntersection(
          flightTrackLine,
          coordinate,
          intersection,
          airspaceViolations
        );
      }
    }

    const endTime = new Date();

    logger.debug(
      "AS: It took " +
        (endTime.getTime() -
          startTime.getTime() +
          "ms to scan for airspace violations")
    );

    if (airspaceViolations.length > 0)
      return { flightTrackLine, airspaceViolations };
  },
};

async function findMatchingAirspaces(airspace) {
  const query = `
    SELECT id,seasons,name,floor,ceiling FROM "Airspaces"
      WHERE name = '${airspace.name}' 
      AND floor = '${airspace.floor}'
      AND ceiling = '${airspace.ceiling}'
      AND class = '${airspace.class}'
      AND ST_Equals(
        "Airspaces".polygon,
		    ST_GeomFromGeoJSON('${JSON.stringify(airspace.polygon)}'));
    `;

  try {
    const result = await FlightFixes.sequelize.query(query, {
      model: Airspace,
    });
    logger.debug("AS: Airspace result " + JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    throw new XccupRestrictionError(
      "Error querying db for matching entries with " + query
    );
  }
}

function checkIfOnlyOneEntryWasFound(results, airspace) {
  if (results?.length > 1) {
    const msg =
      "Found more than one matching entry for the airspace" + airspace.name;
    logger.error("AS: " + msg);
    throw new XccupRestrictionError(msg);
  }
}

function checkIfEntryForSeasonAlreadyExists(entry, airspace) {
  if (entry.seasons.includes(airspace.season)) {
    const msg = `An entry with matching borders for ${airspace.name} and season ${airspace.season} is already present`;
    throw new XccupRestrictionError(msg);
  }
}

async function addNewSeasonToDbEntry(entry, airspace) {
  return await Airspace.update(
    {
      seasons: [...entry.seasons, airspace.season],
    },
    {
      where: {
        id: entry.id,
      },
    }
  );
}

function findVerticalIntersection(
  flightTrackLine,
  coordinate,
  intersection,
  airspaceViolations
) {
  const long = coordinate[0];
  const lat = coordinate[1];

  flightTrackLine.forEach((fix) => {
    if (fix.longitude == long && fix.latitude == lat) {
      const lowerLimit = convertVerticalLimitToMeterMSL(
        intersection.floor,
        fix.elevation
      );
      const upperLimit = convertVerticalLimitToMeterMSL(
        intersection.ceiling,
        fix.elevation
      );
      if (lowerLimit <= fix.gpsAltitude && fix.gpsAltitude <= upperLimit) {
        logger.debug(
          "AS: Found airspace violation at LAT/LONG: " +
            lat +
            "/" +
            long +
            " Altitude:" +
            fix.gpsAltitude +
            " F/C: " +
            lowerLimit +
            "/" +
            upperLimit
        );
        airspaceViolations.push(
          createViolationEntry(
            fix,
            intersection.name,
            lowerLimit,
            upperLimit,
            intersection.floor,
            intersection.ceiling
          )
        );
      }
    }
  });
}

function findViolationOfFL100(fixesWithElevation, airspaceViolations) {
  const fl100InMeters = FEET_IN_METER * 10_000;

  fixesWithElevation.forEach((fix) => {
    if (fix.gpsAltitude >= fl100InMeters) {
      logger.debug(
        "AS: Found violation of FL100 at LAT/LONG: " +
          fix.latitude +
          "/" +
          fix.longitude +
          " Altitude:" +
          fix.gpsAltitude
      );

      const violationFound = createViolationEntry(
        fix,
        "FL100",
        fl100InMeters,
        99999,
        "FL100",
        99999
      );

      airspaceViolations.push(violationFound);
    }
  });
}

function createViolationEntry(
  fix,
  airspaceName,
  lowerLimitMeter,
  upperLimitMeter,
  lowerLimitOriginal,
  upperLimitOriginal
) {
  return {
    lat: fix.latitude,
    long: fix.longitude,
    gpsAltitude: fix.gpsAltitude,
    pressureAltitude: fix.pressureAltitude,
    lowerLimitMeter,
    upperLimitMeter,
    lowerLimitOriginal,
    upperLimitOriginal,
    airspaceName,
    timestamp: fix.timestamp,
  };
}

async function findHorizontalIntersection(fixesId) {
  const query = `
  SELECT id, class, name, floor, ceiling, "intersectionLine" FROM(
    SELECT *, (ST_Dump(ST_Intersection(
      "Airspaces".polygon,
      (SELECT "geom" FROM "FlightFixes" WHERE id =:fixesId)
    ))).geom AS "intersectionLine"
    FROM "Airspaces"
    WHERE date_part('year',now()) = ANY(seasons)
    AND NOT (class='Q' OR class='W'))
  AS "intersectionEntry"
  `;

  const result = await FlightFixes.sequelize.query(query, {
    replacements: {
      fixesId,
    },
    type: FlightFixes.sequelize.QueryTypes.SELECT,
  });

  return result.length == 0 ? [] : result;
}

async function findAirspacesWithinPolygon(year, points) {
  let query = `
  SELECT id FROM "Airspaces"
    WHERE ${year} = ANY(seasons) 
    AND NOT class='W'
  `;

  if (points) {
    const polygonPoints = points.map((e) => e.replace(",", " "));
    // Close polygon and add first entry again as last entry
    polygonPoints.push(polygonPoints[0]);
    const polygonPointsAsLinestring = polygonPoints.join(",");

    query = `
    SELECT id FROM(
      SELECT id, (ST_Dump(ST_Intersection(
        "Airspaces".polygon,
        (SELECT ST_Polygon('LINESTRING(${polygonPointsAsLinestring})'::geometry, 4326))
      ))).geom AS "intersectionPolygon"
      FROM "Airspaces"
      WHERE ${year} = ANY(seasons) 
      AND NOT class='W')
    AS "intersectionEntry"
    `;
  }

  const intersections = await Airspace.sequelize.query(query, {
    type: FlightFixes.sequelize.QueryTypes.SELECT,
  });
  const intersectionIds = intersections.map((e) => e.id);

  const airspaces = await Airspace.findAll({
    where: {
      id: {
        [Op.in]: intersectionIds,
      },
    },
    // To ensure that lower level airspaces are not overlayed by others we will sort these airspaces to the end
    order: [["floor", "asc"]],
  });

  const result = airspaces.length ? airspaces : [];

  return result;
}

module.exports = service;
