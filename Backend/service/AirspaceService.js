const FlightFixes = require("../model/FlightFixes");

const service = {
  getById: async (id) => {
    return await FlightFixes.findByPk(id);
  },

  getByName: async (name) => {
    return await FlightFixes.findOne({
      where: {
        name,
      },
    });
  },

  findIntersection: async function (fixesId) {
    const query = `
    SELECT id, class, name, floor, ceiling, "intersectionLine" 
    FROM(
      SELECT *, (ST_Dump(ST_Intersection(
        "Airspaces".polygon,
        (SELECT geom FROM "Lines" WHERE id =:fixesId)
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

    if (result.length == 0) return null;
  },
};

module.exports = service;
