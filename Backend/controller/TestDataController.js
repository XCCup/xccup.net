const express = require("express");
const logger = require("../config/logger");
const router = express.Router();

// @desc Seeds the DB with the testdatasets
// @route GET /testdata/seed

router.get("/seed", async (req, res, next) => {
  try {
    const { Flight } = req.query;

    if (Flight) {
      const model = require("../config/postgres")["Flight"];
      try {
        await model.destroy({
          truncate: { cascade: true },
        });
      } catch (error) {
        logger.error(error);
      }
      await require("../test/DbTestDataLoader").addFlights();
    } else {
      const { sequelize } = require("../config/postgres");
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

    if (queryParams.length > 0) {
      for (let index = 0; index < queryParams.length; index++) {
        const element = queryParams[index];
        const model = require("../config/postgres")[element];
        await model.destroy({
          truncate: { cascade: true },
        });
      }
    } else {
      const { sequelize } = require("../config/postgres");
      await sequelize.sync({ force: true });
    }

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
