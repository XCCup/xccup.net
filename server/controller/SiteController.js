const express = require("express");
const router = express.Router();
const service = require("../service/FlyingSiteService");

// @desc Gets all site names
// @route GET /sites/names

router.get("/names", async (req, res, next) => {
  try {
    const sites = await service.getAllNames();
    res.json(sites);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
