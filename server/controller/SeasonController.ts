import express, { Request, Response } from "express";
import { BAD_REQUEST, NOT_FOUND, OK } from "../constants/http-status-constants";
import service from "../service/SeasonService";
import { requesterMustBeAdmin } from "./Auth";
import {
  checkIsDateObject,
  checkIsInt,
  validationHasErrors,
  checkIsBoolean,
  checkFieldNotEmpty,
  checkParamIsInt,
} from "./Validation";

const router = express.Router();

// @desc Gets all seasons
// @route GET /seasons

router.get("/", async (req, res, next) => {
  try {
    const seasons = await service.getAll();
    res.json(seasons);
  } catch (error) {
    next(error);
  }
});

// @desc Gets the year of all seasons
// @route GET /seasons/years

router.get("/years", async (req, res, next) => {
  try {
    const years = await service.getAll({ retrieveOnlyYears: true });
    res.json(years);
  } catch (error) {
    next(error);
  }
});

// @desc Get current season detail
// @route GET /seasons/current

router.get("/current", async (req, res, next) => {
  try {
    const season = await service.getCurrentActive();
    res.json(season);
  } catch (error) {
    next(error);
  }
});

// @desc Get latest season detail
// @route GET /seasons/latest

router.get("/latest", async (req, res, next) => {
  try {
    const season = await service.getLatestSeasonDetails();
    res.json(season);
  } catch (error) {
    next(error);
  }
});

// @desc Creates a season
// @route POST /seasons/
// @access Only admin

router.post(
  "/",
  checkIsInt("year"),
  checkIsDateObject("startDate"),
  checkIsDateObject("endDate"),
  checkIsBoolean("isPaused"),
  checkIsInt("pointThresholdForFlight"),
  checkIsInt("numberOfFlightsForShirt"),
  checkFieldNotEmpty("gliderClasses"),
  checkFieldNotEmpty("flightTypeFactors"),
  checkFieldNotEmpty("rankingClasses"),
  checkIsInt("seniorStartAge"),
  checkIsInt("seniorBonusPerAge"),
  checkFieldNotEmpty("activeRankings"),
  checkFieldNotEmpty("misc"),
  requesterMustBeAdmin,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    try {
      await service.create(req.body);
      res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Stores predefined ranking results of a season to the db
// @route GET /seasons/storeResults/
// @access Only admin

router.get(
  "/storeResults/",
  // checkParamIsInt("year"),
  requesterMustBeAdmin,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    try {
      await service.storeOldResults();
      res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Updates a season
// @route PUT /season/
// @access Only admin

router.put(
  "/:id",
  checkIsInt("year"),
  checkIsDateObject("startDate"),
  checkIsDateObject("endDate"),
  checkIsBoolean("isPaused"),
  checkIsInt("pointThresholdForFlight"),
  checkIsInt("numberOfFlightsForShirt"),
  checkFieldNotEmpty("gliderClasses"),
  checkFieldNotEmpty("flightTypeFactors"),
  checkFieldNotEmpty("rankingClasses"),
  checkIsInt("seniorStartAge"),
  checkIsInt("seniorBonusPerAge"),
  checkFieldNotEmpty("activeRankings"),
  checkFieldNotEmpty("misc"),
  requesterMustBeAdmin,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    try {
      const season = await service.getById(req.params.id);

      if (!season) return res.sendStatus(NOT_FOUND);

      await service.update(+req.params.id, req.body);
      res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Deletes a season by id
// @route DELETE /comments/:id
// @access Only admin

// router.delete("/:id", authToken, async (req, res,next) => {
//   const id = req.params.id;
//   const comment = await service.getById(id);

//   if (!comment) {
//     res.sendStatus(NOT_FOUND);
//     return;
//   }

//   if (belongsNotToId(req, res, comment.userId)) {
//     return;
//   }

//   const numberOfDestroyedRows = await service.delete(commentId);
//   res.json(numberOfDestroyedRows);
// });
export default router;
