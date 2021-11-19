const express = require("express");
const router = express.Router();

// @desc Seeds the DB with the testdatasets
// @route GET /testdata/seed

router.get("/seed", async (req, res, next) => {
  try {
    require("../test/DbTestDataLoader").addTestData();
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

// @desc Seeds the DB with the testdatasets
// @route GET /testdata/seed

router.get("/seed", async (req, res, next) => {
  try {
    require("../test/DbTestDataLoader").addTestData();
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
      queryParams.forEach((e) => {
        const model = require("../config/postgres")[e];
        model.destroy({
          truncate: { cascade: true },
        });
      });
    } else {
      const { sequelize } = require("../config/postgres");
      sequelize.sync({ force: true });
    }

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
