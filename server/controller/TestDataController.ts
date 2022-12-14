import { NextFunction, Request, Response } from "express";
import express from "express";
import logger from "../config/logger";
import { cache, deleteCache } from "./CacheManager";
import db from "../db";
import { findLatestForToUser } from "../test/testEmailCache";
import tk from "timekeeper";
import { OK } from "../constants/http-status-constants";

const router = express.Router();

// @desc Seeds the DB with the testdatasets
// @route GET /testdata/seed

router.get("/seed", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { Flight } = req.query;

    deleteCache(["all"]);

    if (Flight) {
      const model = require("../db")["Flight"];
      try {
        await model.destroy({
          truncate: { cascade: true },
        });
      } catch (error) {
        logger.error(error);
      }
      await require("../test/DbTestDataLoader").addFlights();
    } else {
      await db.sequelize.sync({ force: true });
      await require("../test/DbTestDataLoader").addTestData();
    }

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

// @desc Clears one or multiple tables in the DB. If no parameter was provided the whole DB we be cleared.
// @route GET /testdata/clear

router.get(
  "/clear",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryParams = Object.keys(req.query);

      deleteCache(["all"]);

      if (queryParams.length > 0) {
        for (let index = 0; index < queryParams.length; index++) {
          const element = queryParams[index];
          const model = require("../db")[element];
          await model.destroy({
            truncate: { cascade: true },
          });
        }
      } else {
        await db.sequelize.sync({ force: true });
      }

      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Retrieves the last email which was sent to an user.
// @route GET /testdata/email/:toUserEmail

router.get("/email/:toUserEmail", async (req, res, next) => {
  try {
    const lastEmail = findLatestForToUser(req.params.toUserEmail);

    res.json(lastEmail);
  } catch (error) {
    next(error);
  }
});

// @desc Sets the system time on the server
// @route GET /testdata/time/:timestamp

router.get("/time/:timestamp", async (req, res, next) => {
  try {
    const timestamp = req.params.timestamp;

    logger.warn("TDC: Will set system time to " + timestamp);
    tk.travel(new Date(timestamp));
    logger.warn("TDC: New system time was set");

    deleteCache("all");

    res.sendStatus(OK);
  } catch (error) {
    next(error);
  }
});

// @desc Resets the system time
// @route GET /testdata/time/reset

router.get("/time/reset", async (req, res, next) => {
  try {
    logger.warn("TDC: Will reset system time");
    tk.reset();
    logger.warn("TDC: System time was resetted");

    deleteCache("all");

    res.sendStatus(OK);
  } catch (error) {
    next(error);
  }
});

// @desc Freezes the system time on the server
// @route GET /testdata/time/freeze

router.get("/time/reset", async (req, res, next) => {
  try {
    logger.warn("TDC: Will freeze system time");
    tk.freeze(new Date());
    logger.warn("TDC: System time is freezed in");

    deleteCache("all");

    res.sendStatus(OK);
  } catch (error) {
    next(error);
  }
});

export default router;
