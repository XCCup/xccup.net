const express = require("express");
const router = express.Router();
const service = require("../service/ResultService");
const { query } = require("express-validator");
const { validationHasErrors } = require("./Validation");
const { getCache, setCache } = require("./CacheManager");

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
    query("site").optional().not().isEmpty().trim().escape(),
    query("siteId").optional().isUUID(),
    query("region").optional().not().isEmpty().trim().escape(),
    query("state").optional().not().isEmpty().trim().escape(),
    query("club").optional().not().isEmpty().trim().escape(),
    query("clubId").optional().isUUID(),
  ],
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const {
      year,
      rankingClass,
      gender,
      isWeekend,
      isHikeAndFly,
      isSenior,
      limit,
      site,
      siteId,
      region,
      state,
      club,
      clubId,
    } = req.query;

    try {
      const value = getCache(req);
      if (value) return res.json(value);

      const result = await service.getOverall({
        year,
        rankingClass,
        gender,
        isWeekend,
        isHikeAndFly,
        isSenior,
        limit,
        site,
        siteId,
        region,
        state,
        club,
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
    query("region").optional().not().isEmpty().trim().escape(),
    query("limit").optional().isInt(),
  ],
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    const { year, region, limit } = req.query;

    try {
      const result = await service.getTeam(year, region, limit);

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
    query("region").optional().not().isEmpty().trim().escape(),
    query("limit").optional().isInt(),
  ],
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    const { year, region, limit } = req.query;

    try {
      const result = await service.getSenior(year, region, limit);

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
    query("region").optional().not().isEmpty().trim().escape(),
    query("limit").optional().isInt(),
  ],
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    const { year, region, limit } = req.query;

    try {
      const result = await service.getNewcomer(year, region, limit);

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

    const result = await service.getSiteRecords();

    setCache(req, result);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
