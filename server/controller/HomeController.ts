import express, { Request, Response } from "express";
import service from "../service/HomeService";
import liveTrackingService from "../service/LivetrackingService";
import { getCache, setCache } from "./CacheManager";

const router = express.Router();

/**
 * @desc Gets all information needed for the homepage.
 * @desc Live flight data only gets injected when the user is logged in.
 * @route GET /
 */
router.get("/", async (req: Request, res: Response, next) => {
  const liveFlights =
    req.authStatus === "VALID" ? liveTrackingService.getActiveDistances() : [];

  try {
    const cached = getCache(req);
    if (cached) return res.json({ ...cached, liveFlights });

    const homeData = await service.get();

    setCache(req, homeData);

    res.json({ ...homeData, liveFlights });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
