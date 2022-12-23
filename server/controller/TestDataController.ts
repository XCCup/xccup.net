import { NextFunction, Request, Response } from "express";

import express from "express";
import logger from "../config/logger";
import { deleteCache } from "./CacheManager";
import db from "../db";
import { findLatestForToUser } from "../test/testEmailCache";

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

export default router;
