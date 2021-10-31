const express = require("express");
const router = express.Router();
const service = require("../service/ResultService");
const { query } = require("express-validator");
const { validationHasErrors } = require("./Validation");

// @desc Gets the overall result
// @route GET /results

router.get(
  "/",
  [
    query("year").optional().isInt(),
    query("limit").optional().isInt(),
    query("isWeekend").optional().isBoolean(),
    query("isSenior").optional().isBoolean(),
    query("rankingClass").optional().not().isEmpty().trim().escape(),
    query("gender").optional().not().isEmpty().trim().escape(),
    query("site").optional().not().isEmpty().trim().escape(),
    query("region").optional().not().isEmpty().trim().escape(),
    query("state").optional().not().isEmpty().trim().escape(),
    query("club").optional().not().isEmpty().trim().escape(),
  ],
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const year = req.query.year;
    const rankingClass = req.query.rankingClass;
    const gender = req.query.gender;
    const isWeekend = req.query.isWeekend;
    const isSenior = req.query.isSenior;
    const limit = req.query.limit;
    const site = req.query.site;
    const region = req.query.region;
    const state = req.query.state;
    const club = req.query.club;

    try {
      const result = await service.getOverall(
        year,
        rankingClass,
        gender,
        isWeekend,
        isSenior,
        limit,
        site,
        region,
        state,
        club
      );
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
    const year = req.query.year;
    const limit = req.query.limit;

    try {
      const result = await service.getClub(year, limit);
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
    const year = req.query.year;
    const region = req.query.region;
    const limit = req.query.limit;

    try {
      const result = await service.getTeam(year, region, limit);
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
    const { year, region, limit } = req.query;

    try {
      const result = await service.getSenior(year, region, limit);
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
    const { year, region, limit } = req.query;

    try {
      const result = await service.getNewcomer(year, region, limit);
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
    const result = await service.getSiteRecords();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
