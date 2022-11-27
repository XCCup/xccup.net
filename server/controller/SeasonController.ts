import express, { Request, Response } from "express";
import { OK } from "../constants/http-status-constants";
import { GENDER } from "../constants/user-constants";
import { getCurrentYear } from "../helper/Utils";
import { getOverall, RANKINGS, getClub, getTeam, getSenior, getNewcomer, getLuxemburg, getRhineland } from "../service/ResultService";
import service from "../service/SeasonService";
import { requesterMustBeAdmin } from "./Auth";

const router = express.Router();

// @desc Gets all seasons
// @route GET /seasons

router.get("/", async (req: Request, res: Response, next) => {
  try {
    const seasons = await service.getAll();
    res.json(seasons);
  } catch (error) {
    next(error);
  }
});

// @desc Gets the year of all seasons
// @route GET /seasons/years

router.get("/years", async (req: Request, res: Response, next) => {
  try {
    const years = await service.getAll({ retrieveOnlyYears: true });
    res.json(years);
  } catch (error) {
    next(error);
  }
});

// @desc Get current season detail
// @route GET /seasons/current

router.get("/current", async (req: Request, res: Response, next) => {
  try {
    const seasons = await service.getCurrentActive();
    res.json(seasons);
  } catch (error) {
    next(error);
  }
});



// @desc Finalizes a season and stores the results of the several rankings
// @route POST /seasons/current/finalize
// @access Only admin

router.post("/current/finalize", requesterMustBeAdmin, async (req: Request, res: Response, next) => {
  getCurrentYear
  const year = getCurrentYear()
  try {
    const results = [
      { [RANKINGS.OVERALL]: getOverall() },
      // @ts-ignore
      { [RANKINGS.LADIES]: getOverall({ year, gender: GENDER.FEMALE }) },
      { [RANKINGS.CLUB]: getClub() },
      { [RANKINGS.TEAM]: getTeam() },
      { [RANKINGS.SENIORS]: getSenior() },
      { [RANKINGS.NEWCOMER]: getNewcomer() },
      { [RANKINGS.LUX]: getLuxemburg(getCurrentYear()) },
      { [RANKINGS.RP]: getRhineland(getCurrentYear()) },
    ];

    await service.finalize({ results });
    res.sendStatus(OK);
  } catch (error) {
    next(error);
  }
});

// @desc Adds a season
// @route POST /season/

// router.post("/", authToken, async (req, res,next) => {
//   try {
//     const comment = await service.create(req.body);
//     res.json(comment);
//   } catch (error) {
//     logger.(error);
//     res.status(INTERNAL_SERVER_ERROR).send(error.message);
//   }
// });

// @desc Edits a season
// @route GET /season/
// @access Only admin

// router.put("/:id", authToken, async (req, res,next) => {
//   const commentId = req.params.id;
//   const comment = await service.getById(commentId);

//   if (belongsNotToId(req, res, comment.userId)) {
//     return;
//   }

//   comment.message = req.body.message;
//   const result = await service.update(comment);

//   res.json(result);
// });

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

module.exports = router;
