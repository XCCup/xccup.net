const FlightFixes = require("../config/postgres")["FlightFixes"];
const Airspace = require("../config/postgres")["Airspace"];
const { Op } = require("sequelize");

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

  /**
   * class='RMZ', 'Q', 'W' will not be retrieved
   */
  getAllRelevant: async () => {
    return Airspace.findAll({
      where: {
        class: {
          [Op.notIn]: ["RMZ", "Q", "W"],
        },
      },
    });
  },

  hasAirspaceViolation: async (fixesWithElevation) => {
    const startTime = new Date();
    const intersections2D = await find2dIntersection(fixesWithElevation.id);

    const line = FlightFixes.mergeData(fixesWithElevation);

    let violationFound = false;
    for (let rI = 0; rI < intersections2D.length && !violationFound; rI++) {
      const intersection = intersections2D[rI];

      for (
        let cI = 0;
        cI < intersection.intersectionLine.coordinates.length &&
        !violationFound;
        cI++
      ) {
        const coordinate = intersection.intersectionLine.coordinates[cI];
        const long = coordinate[0];
        const lat = coordinate[1];

        line.forEach((fix) => {
          if (fix.longitude == long && fix.latitude == lat) {
            const floorInMeter = convertToMeterMSL(
              intersection.floor,
              fix.elevation
            );
            const ceilingInMeter = convertToMeterMSL(
              intersection.ceiling,
              fix.elevation
            );

            if (
              floorInMeter <= fix.pressureAltitude &&
              fix.pressureAltitude <= ceilingInMeter
            ) {
              console.log(
                "Found airspace violation at LAT/LONG: " +
                  lat +
                  "/" +
                  long +
                  " Baro:" +
                  fix.pressureAltitude +
                  " F/C: " +
                  floorInMeter +
                  "/" +
                  ceilingInMeter
              );
              violationFound = true;
              return;
            }
          }
        });
      }
    }

    const endTime = new Date();

    console.log(
      "It took " +
        (endTime.getTime() -
          startTime.getTime() +
          "ms to scan for airspace violations")
    );

    return violationFound;
  },
};

async function find2dIntersection(fixesId) {
  const query = `
  SELECT id, class, name, floor, ceiling, "intersectionLine" FROM(
    SELECT *, (ST_Dump(ST_Intersection(
      "Airspaces".polygon,
      (SELECT "geom" FROM "FlightFixes" WHERE id =:fixesId)
    ))).geom AS "intersectionLine"
    FROM "Airspaces"
    WHERE season=date_part('year',now()) 
    AND NOT (class='RMZ' OR class='Q' OR class='W'))
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

function convertToMeterMSL(heightValue, elevation) {
  if (heightValue.includes("GND")) {
    return 0;
  }
  if (heightValue.includes("AGL")) {
    const regex = /(\d+)ft AGL/;
    const matchingResult = heightValue.match(regex);
    return convertFeetToMeter(matchingResult[1]) + elevation;
  }
  if (heightValue.includes("MSL")) {
    const regex = /(\d+)ft MSL/;
    const matchingResult = heightValue.match(regex);
    return convertFeetToMeter(matchingResult[1]);
  }
  if (heightValue.includes("FL")) {
    const regex = /FL(\d+)/;
    const matchingResult = heightValue.match(regex);
    return convertFeetToMeter(matchingResult[1] * 100);
  }
  console.log("No parsable height value found: " + heightValue);
}

function convertFeetToMeter(feet) {
  return feet * 0.3048;
}

module.exports = service;
