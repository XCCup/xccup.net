const express = require("express");
const router = express.Router();
const { getCurrentActive } = require("../service/SeasonService");
const { getAllBrands } = require("../service/FlightService");
const {
  STATE: flightStates,
  TYPE: types,
} = require("../constants/flight-constants");
const {
  GENDER: genders,
  COUNTRY: countries,
  STATE: conutryStates,
  TSHIRT_SIZES,
} = require("../constants/user-constants");

// @desc Gets all gliderClasses of the current season
// @route GET /general/gliderClasses

router.get("/gliderClasses", async (req, res, next) => {
  try {
    const gliderClasses = (await getCurrentActive()).gliderClasses;
    res.json(gliderClasses);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all rankingClasses of the current season
// @route GET /general/rankingClasses

router.get("/rankingClasses", async (req, res, next) => {
  try {
    const rankingClasses = (await getCurrentActive()).rankingClasses;
    res.json(rankingClasses);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all brands of gliders which exist in the db
// @route GET /general/brands

router.get("/brands", async (req, res, next) => {
  try {
    const brands = await getAllBrands();
    res.json(brands);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all possiblites of flightStates
// @route GET /general/flight/states

router.get("/flight/states", async (req, res, next) => {
  try {
    res.json(flightStates);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all possiblites of flightTypes
// @route GET /general/flight/types

router.get("/flight/types", async (req, res, next) => {
  try {
    res.json(types);
  } catch (error) {
    next(error);
  }
});

// @desc Gets user profile constants
// @route GET /general/user/constants

router.get("/user/constants", async (req, res, next) => {
  try {
    const userConstants = {
      genders: genders,
      countries: countries,
      states: conutryStates,
      tShirtSizes: TSHIRT_SIZES,
    };
    res.json(userConstants);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
