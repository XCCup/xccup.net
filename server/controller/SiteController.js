const express = require("express");
const router = express.Router();
const service = require("../service/FlyingSiteService");
const { getCache, setCache } = require("./CacheManager");

// @desc Gets all site names
// @route GET /sites/names

router.get("/names", async (req, res, next) => {
  try {
    const value = getCache(req);
    if (value) return res.json(value);

    const sites = await service.getAllNames();

    setCache(req, sites);

    res.json(sites);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
