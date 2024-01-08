import express, { Request, Response } from "express";
import service from "../service/HomeService";
import liveTrackingService from "../service/LivetrackingService";
import { getCache, setCache } from "./CacheManager";

const router = express.Router();
// @desc Gets all information needed for the homepage
// @route GET /

router.get("/", async (req: Request, res: Response, next) => {
  try {
    const cached = getCache(req);
    if (cached) {
      // Inject active flights to avoid caching
      cached.activeFlights = liveTrackingService.getActiveDistances();
      return res.json(cached);
    }

    const homeData = await service.get();

    setCache(req, homeData);

    const liveData = liveTrackingService.getActiveDistances();
    // Inject active
    res.json({ ...homeData, liveData });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
