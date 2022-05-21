const express = require("express");
const logger = require("../config/logger");
const { deleteCache } = require("./CacheManager");
const router = express.Router();
const { sequelize } = require("../db");

// @desc Seeds the DB with the testdatasets
// @route GET /testdata/seed

router.get("/seed", async (req, res, next) => {
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
      await sequelize.sync({ force: true });
      await require("../test/DbTestDataLoader").addTestData();
    }

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

// @desc Clears one or multiple tables in the DB. If no parameter was provided the whole DB we be cleared.
// @route GET /testdata/clear

router.get("/clear", async (req, res, next) => {
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
      await sequelize.sync({ force: true });
    }

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

// @desc Retrieves the last email which was sent to an user.
// @route GET /testdata/email/:toUserEmail

router.get("/email/:toUserEmail", async (req, res, next) => {
  try {
    const testEmailCache = require("../test/testEmailCache");
    const lastEmail = testEmailCache.findLatestForToUser(
      req.params.toUserEmail
    );

    res.json(lastEmail);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
