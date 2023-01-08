const express = require("express");
const router = express.Router();
const { getCurrentActive } = require("../service/SeasonService");
const { getAllBrands } = require("../service/FlightService");
const {
  STATE: flightStates,
  TYPE: types,
  REGIONS,
} = require("../constants/flight-constants");
const {
  GENDER: genders,
  COUNTRY: countries,
  STATE: countryStates,
  TSHIRT_SIZES,
  GENDER,
  STATE,
} = require("../constants/user-constants");

const { getCache, setCache } = require("./CacheManager");
const userService = require("../service/UserService");
const siteService = require("../service/FlyingSiteService");
const clubService = require("../service/ClubService");
const teamService = require("../service/TeamService");

// @desc Gets all gliderClasses of the current season
// @route GET /general/gliderClasses

router.get("/gliderClasses", async (req, res, next) => {
  try {
    const value = getCache(req);
    if (value) return res.json(value);

    const gliderClasses = (await getCurrentActive()).gliderClasses;

    setCache(req, gliderClasses);

    res.json(gliderClasses);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all rankingClasses of the current season
// @route GET /general/rankingClasses

router.get("/rankingClasses", async (req, res, next) => {
  try {
    const value = getCache(req);
    if (value) return res.json(value);

    const rankingClasses = (await getCurrentActive()).rankingClasses;

    setCache(req, rankingClasses);

    res.json(rankingClasses);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all brands of gliders which exist in the db
// @route GET /general/brands

router.get("/brands", async (req, res, next) => {
  try {
    const value = getCache(req);
    if (value) return res.json(value);

    const brands = await getAllBrands();

    setCache(req, brands);

    res.json(brands);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all filter options for flights and results
// @route GET /general/filterOptions

router.get("/filterOptions", async (req, res, next) => {
  try {
    const value = getCache(req);
    res.set("Cache-control", "public, max-age=3600, immutable");
    if (value) return res.json(value);

    const userNamesQuery = userService.getAllNames();
    const siteNamesQuery = siteService.getAllNames();
    const clubNamesQuery = clubService.getAllNames({
      includeAllClubsWhichEverCompeted: true,
    });
    const teamNamesQuery = teamService.getAllNames({
      includeAllTeamsWhichEverCompeted: true,
    });
    const brandNamesQuery = getAllBrands();

    const [
      userNames,
      siteNames,
      clubNames,
      teamNames,
      brandNames,
      seasonDetails,
    ] = await Promise.all([
      userNamesQuery,
      siteNamesQuery,
      clubNamesQuery,
      teamNamesQuery,
      brandNamesQuery,
      getCurrentActive(),
    ]);

    const resultObject = {
      userNames,
      siteNames,
      clubNames,
      teamNames,
      brandNames,
      rankingClasses: seasonDetails.rankingClasses,
      states: STATE,
      regions: REGIONS,
      genders: GENDER,
    };

    setCache(req, resultObject);

    res.json(resultObject);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all possibilities of flightStates
// @route GET /general/flight/states

router.get("/flight/states", async (req, res, next) => {
  try {
    res.json(flightStates);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all possibilities of flightTypes
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
      states: countryStates,
      tShirtSizes: TSHIRT_SIZES,
    };
    res.json(userConstants);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
