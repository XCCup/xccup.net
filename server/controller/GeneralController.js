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

// @desc Gets all possiblites of genders
// @route GET /general/user/genders

router.get("/user/genders", async (req, res, next) => {
  try {
    res.json(genders);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all by the xccup regconized countries
// @route GET /general/user/countries

router.get("/user/countries", async (req, res, next) => {
  try {
    res.json(countries);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all by the xccup regconized states of countries
// @route GET /general/user/states

router.get("/user/states", async (req, res, next) => {
  try {
    res.json(conutryStates);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all possible tshirt sizes
// @route GET /general/user/tshirtSizes

router.get("/user/tshirtSizes", async (req, res, next) => {
  try {
    res.json(TSHIRT_SIZES);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
