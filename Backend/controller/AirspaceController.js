const express = require("express");
const router = express.Router();
const service = require("../service/AirspaceService");
const { query } = require("express-validator");
const { validationHasErrors } = require("./Validation");

const POINTS_FORMAT =
  /(\d+.\d+,\d+.\d+)\|(\d+.\d+,\d+.\d+)\|(\d+.\d+,\d+.\d+)\|(\d+.\d+,\d+.\d+)/;

// @desc Gets all airspaces which are relevant for airspace violations (RMZ, Q, W are excluded)
// @route GET /airspaces/relevant

router.get(
  "/relevant",
  query("p")
    .optional()
    .custom((p) => customValidatorPoints(p))
    .withMessage(
      "The points must be presented in the following format: p=6.66,50.22|7.44,50.07|7.52,49.98|6.70,49.98|6.66,50.22"
    ),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const { p } = req.query;

    let points;
    const matchResult = p?.match(POINTS_FORMAT);
    if (matchResult) {
      points = [matchResult[1], matchResult[2], matchResult[3], matchResult[4]];
    }

    try {
      const airspaces = points
        ? await service.getAllRelevantInPolygon(points)
        : await service.getAllRelevant();
      res.json(airspaces);
    } catch (error) {
      next(error);
    }
  }
);

function customValidatorPoints(p) {
  const matchingResult = p.match(POINTS_FORMAT);
  return matchingResult[0];
}

module.exports = router;
