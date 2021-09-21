const express = require("express");
const router = express.Router();
const service = require("../service/AirspaceService");

// @desc Gets all airspaces with are relevant for airspace violations (RMZ, Q, W are excluded)
// @route GET /airspaces/relevant

router.get("/relevant", async (req, res, next) => {
  try {
    const airspaces = await service.getAllRelevant();
    res.json(airspaces);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
