const express = require("express");
const router = express.Router();
const { getCurrentActive } = require("../service/SeasonService");
const { getAllBrands } = require("../service/FlightService");

// @desc Gets all gliderClasses of the current season
// @route GET /seasons

router.get("/gliderClasses", async (req, res, next) => {
  try {
    const gliderClasses = (await getCurrentActive()).gliderClasses;
    res.json(gliderClasses);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all rankingClasses of the current season
// @route GET /seasons

router.get("/rankingClasses", async (req, res, next) => {
  try {
    const rankingClasses = (await getCurrentActive()).rankingClasses;
    res.json(rankingClasses);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all brands of gliders which exist in the db
// @route GET /seasons

router.get("/brands", async (req, res, next) => {
  try {
    const brands = await getAllBrands();
    res.json(brands);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
