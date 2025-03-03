import express, { Request, Response } from "express";
import service from "../service/ResultService";
import { query } from "express-validator";
import { validationHasErrors, checkParamIsOnlyOfValue } from "./Validation";
import { getCache, setCache } from "./CacheManager";
import { STATE, COUNTRY } from "../constants/user-constants";
import { XccupHttpError } from "../helper/ErrorHandler";
import { NOT_FOUND } from "../constants/http-status-constants";
import { getSiteRecords } from "../service/SiteRecordCache";
import { NextFunction } from "express-serve-static-core";

const router = express.Router();

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
    query("isReynoldsClass").optional().isBoolean(),
    query("rankingClass").optional().not().isEmpty().trim().escape(),
    query("gender").optional().not().isEmpty().trim().escape(),
    query("homeStateOfUser").optional().not().isEmpty().trim().escape(),
    query("siteShortName").optional().not().isEmpty().trim().escape(),
    query("siteId").optional().isUUID(),
    query("siteRegion").optional().not().isEmpty().trim().escape(),
    query("clubShortName").optional().not().isEmpty().trim().escape(),
    query("clubId").optional().isUUID(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    if (validationHasErrors(req, res)) return;

    try {
      const value = getCache(req);
      if (value) return res.json(value);

      const result = await service.getOverall({
        ...req.query,
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

// router.get("/club/:club", async (req: Request, res: Response,next) => {
//   // const result = await service.getOverall();
//   res.json(null);
// });

// @desc Gets the result for the club ranking
// @route GET /results/clubs

router.get(
  "/clubs",
  [query("year").optional().isInt(), query("limit").optional().isInt()],
  async (req: Request, res: Response, next: NextFunction) => {
    if (validationHasErrors(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    try {
      const result = await service.getClub({
        ...req.query,
      });

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
  async (req: Request, res: Response, next: NextFunction) => {
    if (validationHasErrors(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    try {
      const result = await service.getTeam({
        ...req.query,
      });

      setCache(req, result);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Gets the result for the senior ranking (additional bonus per age)
// @route GET /results/seniors/

router.get(
  "/seniors",
  [
    query("year").optional().isInt(),
    query("siteRegion").optional().not().isEmpty().trim().escape(),
    query("limit").optional().isInt(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    if (validationHasErrors(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    try {
      const result = await service.getSenior({
        ...req.query,
      });

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
  async (req: Request, res: Response, next) => {
    if (validationHasErrors(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    const isoCode = req.params.isoCode;

    try {
      let resultFunction;
      switch (isoCode) {
        case "LUX":
          resultFunction = service.getLuxembourg;
          break;
        case "RP":
          resultFunction = service.getRhineland;
          break;
        case "HE":
          resultFunction = service.getHesse;
          break;
        default:
          throw new XccupHttpError(
            NOT_FOUND,
            `No ranking defined for ${isoCode}`
          );
      }

      const result = await resultFunction({
        ...req.query,
      });

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
  async (req: Request, res: Response, next: NextFunction) => {
    if (validationHasErrors(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    try {
      const result = await service.getEarlyBird({
        ...req.query,
      });

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
  async (req: Request, res: Response, next: NextFunction) => {
    if (validationHasErrors(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    try {
      const result = await service.getLateBird({
        ...req.query,
      });

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
  async (req: Request, res: Response, next: NextFunction) => {
    if (validationHasErrors(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    try {
      const result = await service.getNewcomer({
        ...req.query,
      });

      setCache(req, result);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Gets the result for the reynolds class
// @route GET /results/reynolds-class/

router.get(
  "/reynolds-class",
  [
    query("year").optional().isInt(),
    query("siteRegion").optional().not().isEmpty().trim().escape(),
    query("limit").optional().isInt(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    if (validationHasErrors(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    try {
      const result = await service.getReynoldsClass({
        ...req.query,
      });

      setCache(req, result);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Gets the records for all flightTypes over all flyingSites
// @route GET /results/siteRecords/

router.get("/siteRecords", async (req: Request, res: Response, next) => {
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
export default router;
