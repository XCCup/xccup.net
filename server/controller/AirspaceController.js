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
      'The points must be presented in the following format: p=6.01,51.49|10.39,51.49|10.39,49.98|6.01,49.98.\nThere are only 4 points valid. Points start in the "upper left corner" and continue clockwise.'
    ),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const { p } = req.query;

    const matchResult = p?.match(POINTS_FORMAT);
    let points = matchResult
      ? [matchResult[1], matchResult[2], matchResult[3], matchResult[4]]
      : undefined;

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
