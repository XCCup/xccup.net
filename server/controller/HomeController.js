const express = require("express");
const router = express.Router();
const service = require("../service/HomeService");
const liveTrackingService = require("../service/LivetrackingService");
const { getCache, setCache } = require("./CacheManager");

// @desc Gets all information needed for the homepage
// @route GET /

router.get("/", async (req, res, next) => {
  try {
    const value = getCache(req);
    if (value) {
      //Inject active flights to avoid caching
      value.activeFlights = liveTrackingService.getActiveDistances();
      return res.json(value);
    }

    const result = await service.get();

    setCache(req, result);

    //Inject active
    result.activeFlights = liveTrackingService.getActiveDistances();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
