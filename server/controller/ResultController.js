const express = require("express");
const router = express.Router();
const service = require("../service/ResultService");
const { query } = require("express-validator");
const {
  validationHasErrors,
  checkParamIsOnlyOfValue,
} = require("./Validation");
const { getCache, setCache } = require("./CacheManager");
const { STATE, COUNTRY } = require("../constants/user-constants");
const { XccupHttpError } = require("../helper/ErrorHandler");
const { NOT_FOUND } = require("../constants/http-status-constants");
const { getSiteRecords } = require("../service/SiteRecordCache");

// @desc Gets the overall result
// @route GET /results

router.get(
  "/",
  [
    query("year").optional().isInt(),
    query("limit").optional().isInt(),
    query("isWeekend").optional().isBoolean(),
    query("isHikeAndFly").optional().isBoolean(),
    query("isSenior").optional().isBoolean(),
    query("rankingClass").optional().not().isEmpty().trim().escape(),
    query("gender").optional().not().isEmpty().trim().escape(),
    query("homeStateOfUser").optional().not().isEmpty().trim().escape(),
    query("siteShortName").optional().not().isEmpty().trim().escape(),
    query("siteId").optional().isUUID(),
    query("siteRegion").optional().not().isEmpty().trim().escape(),
    query("clubShortName").optional().not().isEmpty().trim().escape(),
    query("clubId").optional().isUUID(),
  ],
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const {
      year,
      rankingClass,
      gender,
      homeStateOfUser,
      isWeekend,
      isHikeAndFly,
      isSenior,
      limit,
      siteShortName,
      siteId,
      siteRegion,
      clubShortName,
      clubId,
    } = req.query;

    try {
      const value = getCache(req);
      if (value) return res.json(value);

      const result = await service.getOverall({
        year,
        rankingClass,
        gender,
        homeStateOfUser,
        isWeekend,
        isHikeAndFly,
        isSenior,
        limit,
        siteShortName,
        siteId,
        siteRegion,
        clubShortName,
        clubId,
      });

      setCache(req, result);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Gets the result for a specific club
// @route GET /results/club/:club

// router.get("/club/:club", async (req, res,next) => {
//   // const result = await service.getOverall();
//   res.json(null);
// });

// @desc Gets the result for the club ranking
// @route GET /results/clubs

router.get(
  "/clubs",
  [query("year").optional().isInt(), query("limit").optional().isInt()],
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    const { year, limit } = req.query;

    try {
      const result = await service.getClub(year, limit);

      setCache(req, result);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Gets the result for the team ranking
// @route GET /results/teams/

router.get(
  "/teams",
  [
    query("year").optional().isInt(),
    query("siteRegion").optional().not().isEmpty().trim().escape(),
    query("limit").optional().isInt(),
  ],
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    const { year, siteRegion, limit } = req.query;

    try {
      const result = await service.getTeam(year, siteRegion, limit);

      setCache(req, result);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Gets the result for the senior ranking (addional bonus per age)
// @route GET /results/seniors/

router.get(
  "/seniors",
  [
    query("year").optional().isInt(),
    query("siteRegion").optional().not().isEmpty().trim().escape(),
    query("limit").optional().isInt(),
  ],
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    const { year, region: siteRegion, limit } = req.query;

    try {
      const result = await service.getSenior(year, siteRegion, limit);

      setCache(req, result);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Gets the result for a state / country cup
// @route GET /results/state/:isoCode

router.get(
  "/state/:isoCode",
  query("year").optional().isInt(),
  query("limit").optional().isInt(),
  checkParamIsOnlyOfValue(
    "isoCode",
    Object.keys(STATE).concat(Object.keys(COUNTRY))
  ),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    const { year, limit } = req.query;
    const isoCode = req.params.isoCode;

    try {
      let resultFunction;
      switch (isoCode) {
        case "LUX":
          resultFunction = service.getLuxemburg;
          break;
        case "RP":
          resultFunction = service.getRhineland;
          break;
        default:
          throw new XccupHttpError(
            NOT_FOUND,
            `No ranking defined for ${isoCode}`
          );
      }

      const result = await resultFunction(year, limit);

      setCache(req, result);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Gets the result for the early bird ranking (first N flights of the season)
// @route GET /results/earlybird/

router.get(
  "/earlybird",
  [
    query("year").optional().isInt(),
    query("siteRegion").optional().not().isEmpty().trim().escape(),
  ],
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    const { year, siteRegion } = req.query;

    try {
      const result = await service.getEarlyBird(year, siteRegion);

      setCache(req, result);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Gets the result for the late bird ranking (last N flights of the season)
// @route GET /results/latebird/

router.get(
  "/latebird",
  [
    query("year").optional().isInt(),
    query("siteRegion").optional().not().isEmpty().trim().escape(),
  ],
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    const { year, siteRegion } = req.query;

    try {
      const result = await service.getLateBird(year, siteRegion);

      setCache(req, result);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Gets the result for the newcomer ranking
// @route GET /results/newcomer/

router.get(
  "/newcomer",
  [
    query("year").optional().isInt(),
    query("siteRegion").optional().not().isEmpty().trim().escape(),
    query("limit").optional().isInt(),
  ],
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    const { year, siteRegion, limit } = req.query;

    try {
      const result = await service.getNewcomer(year, siteRegion, limit);

      setCache(req, result);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Gets the records for all flightTypes over all flyingSites
// @route GET /results/siteRecords/
router.get("/siteRecords", async (req, res, next) => {
  try {
    const value = getCache(req);
    if (value) return res.json(value);

    const result = await getSiteRecords();

    setCache(req, result);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Run this function once at server start because this route take quiet a while on first call...
getSiteRecords();

module.exports = router;
